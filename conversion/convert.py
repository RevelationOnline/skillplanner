#    Skill converter
#    Copyright (C) 2015 Andreas Rammhold <andreas@rammhold.de>
#
#    This program is free software: you can redistribute it and/or modify
#    it under the terms of the GNU Affero General Public License as
#    published by the Free Software Foundation, either version 3 of the
#    License, or (at your option) any later version.
#
#    This program is distributed in the hope that it will be useful,
#    but WITHOUT ANY WARRANTY; without even the implied warranty of
#    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
#    GNU Affero General Public License for more details.
#
#    You should have received a copy of the GNU Affero General Public License
#    along with this program.  If not, see <http://www.gnu.org/licenses/>.

import json
import csv


class Skill(object):

    @staticmethod
    def _convert_list(inp):
        return list(x for x in inp.strip().split(',') if x != '')

    @staticmethod
    def _convert_dict(inp):
        l = Skill._convert_list(inp)
        tuples = [ x.split('=') for x in l]
        try:
            if len(tuples) > 0:
                tuples = [
                    (key, int(val)) for (key, val) in tuples
                ]

                return dict(tuples)
        except ValueError:
            print(tuples)
            raise

    def _list_converted_attribute(self, attr):
        v = getattr(self, attr)
        if type(v) == str:
            v = self._convert_list(v)
            setattr(self, attr, v)
        return v

    def _dict_converted_attribute(self, attr):
        v = getattr(self, attr)
        if type(v) == str:
            v = self._convert_dict(v)
            setattr(self, attr, v)
        return v



    def __init__(self, pos, **kwargs):
        self._pos = pos
        #TODO: fix this lazy stuff to be more strict on the arguments
        for key, val in kwargs.items():
            if val == 'True':
                val = True
            elif val == 'False':
                val = False
            elif type(val) == str:
                val = val.strip()
            setattr(self, key, val)

    @property
    def parent(self):
        if getattr(self, '_parent', None) is None:
            if self.PARENT == "":
                return None
            return self.PARENT
        else:
            return self._parent

    @property
    def skill_mods(self):
        return self._dict_converted_attribute('SKILL_MODS')

    @property
    def pos(self):
        return self._pos

    @property
    def is_profession(self):
        return self.IS_PROFESSION

    @property
    def preclusion_skills(self):
        return self._list_converted_attribute('PRECLUSION_SKILLS')

    @property
    def graph_type(self):
        return self.GRAPH_TYPE

    @property
    def is_god_only(self):
        return self.GOD_ONLY

    @property
    def skills_required(self):
        if getattr(self, '_skills_required', None) is None:
            return self._list_converted_attribute('SKILLS_REQUIRED')
        else:
            return self._skills_required

    @property
    def name(self):
        return self.NAME

    @property
    def graph_type(self):
        if self.GRAPH_TYPE == '1':
            return 'oneByFour'
        elif self.GRAPH_TYPE == '2':
            return 'twoByFour'
        elif self.GRAPH_TYPE == '3':
            return 'threeByFour'
        elif self.GRAPH_TYPE == '4':
            return 'fourByFour'
        elif self.GRAPH_TYPE == '5':
            return 'pyramid'
        else:
            return self.GRAPH_TYPE

    @classmethod
    def createFromDict(cls, pos, dict):
        return cls(pos, **dict)

    def __str__(self):
        return """ %s (Parent: %s, Preq: %s, Mods: %s) """ % (self.name, self.parent,  self.preclusion_skills, self.SKILL_MODS)
        return self.name

    def __repr__(self):
        return self.name


class Reader(object):
    def __init__(self, file):

        fh = open(file, 'r')

        dialect = csv.Sniffer().sniff(fh.readline())
        fh.seek(0)
        self._reader = csv.DictReader(fh.readlines(), dialect=dialect)

    def items(self):
        return list(x for x in self)

    def __iter__(self):
        for i,dict in enumerate(self._reader.__iter__()):
            if dict['NAME'].strip() == "":
                continue
            """
            We've to enumerate the entries since the order seems to define the position of the tree.
            We will order the resulting trees by index.. this is ugly but seems to be the only option.
            """
            yield Skill.createFromDict(i, dict)

class GraphNode(object):
    content = property(lambda x: x._content)

    def __init__(self, content, _parent=None):
        self._content = content
        self._parent = _parent
        self._childs = []

    def addChild(self, new_child):
        assert issubclass(type(new_child), GraphNode)


        if new_child._parent != None:
            new_child._parent.removeChild(new_child)

        if not self.contains(new_child, _compare_content=False):
            self._childs.append(new_child)
            new_child._parent = self
        return new_child

    def removeChild(self, child):

        if not self.contains(child, _compare_content=False):
            return

        self._childs.remove(child)
        child._parent = None

        return child

    def contains(self, node, _compare_content=True, cmp=lambda x,y: x == y):
        if _compare_content:
            childs = ( (x, x.content) for x in  self._childs)
        else:
            childs = ( (x, x) for x in self._childs)

        for n, content in childs:
            if cmp(content, node):
                return n

        for child in self._childs:
            res = child.contains(node, _compare_content, cmp=cmp)
            if not res is False:
                return res

        return False

    def walk(self, converter=lambda x: x, depth=15):
        yield converter(self)
        if depth > 0:
            for child in self._childs:
                yield from child.walk(converter=converter, depth=depth-1)

    def format(self, level=0):
        s = (level * '\t') + "%s =>\n" % (self.content)
        s += '\n'.join((x.format(level+1) for x in self._childs))

        return s

    def getRootParent(self):
        if self._parent.content == 'root':
            return self
        return self._parent.getRootParent()

    def __str__(self):
        return self.format(level=0)

class ProfessionGraph(object):
    def __init__(self, initial_graph=None):
        if initial_graph is None:
            initial_graph = GraphNode('root')

        self.root = initial_graph

    def addSkill(self, skill):
        res = self.root.contains(skill)
        if res is False:
            return self._insert(skill)
        return res

    def _insert(self, skill):
        """
        :param skill: skill to addd
        :return:
        """
        if not skill.parent:
            return self.root.addChild(GraphNode(skill))

        if type(skill.parent) != Skill:
            parent = self.root.contains(skill.parent, cmp=lambda x, y: x.name == y)
        else:
            parent = self.root.contains(skill.parent)
        if not parent:
            raise RuntimeError("Parent not found: %s for %s %s" % (skill.parent, skill.name, parent))
        else:
            parent.addChild(GraphNode(skill))

    def resolveRequierments(self):
        for skill in self.root.walk(converter=lambda x: x.content):
            if skill == 'root':
                continue
            if type(skill.parent) == str:
                if skill.parent == "":
                    continue
                parent = self.root.contains(skill.parent, cmp=lambda x, y: x.name == y)
                if parent:
                    skill._parent = parent = parent.content
                    #print('Setting parent ref for %s to %s' % (skill.name, parent.name))
                del parent
            new_req_skills = []
            for req_skill in skill.skills_required:
                if type(req_skill) == str:
                    if len(req_skill) == 0:
                        continue

                    req = self.root.contains(req_skill, cmp=lambda x, y: x.name == y)
                    if req:
                        new_req_skills.append(req.content)
            skill._skills_required = new_req_skills



        for skill in self.root.walk(converter=lambda x: x.content):
            if skill == "root" or skill.parent is None:
                continue
            assert type(skill.parent) != str, skill

    def generateProfessions(self):
        skills = {}

        profession_nodes = ( (node, node.walk(depth=1)) for node in self.root.walk(depth=4) if
                       type(node.content) == Skill and node.content.is_profession and not node.content.is_god_only )


        professions = {}
        for node, skills in profession_nodes:
            prof_skill = node.content
            profession = dict(
                name=prof_skill.name,
            )
            skill_nodes = list(skills)
            # get the novice an master boxes
            # the novice box has 4 child branches on the PROFESSION NODE which are requesting it in skills_required
            # the master box is child of the profession
            # but all the skills_required are childs of the profession

            novice_node = None
            master_node = None


            l = ((snode,
                  sum([ snode.content in n.content.skills_required for n in node.walk(depth=1) if n != snode and n != node ])
                  ) for snode in skill_nodes)

            novice_node = max(l, key=lambda x:x[1])[0]

            l = ((snode,
                  sum([
                      n.content in snode.content.skills_required for n in node.walk(depth=10) if n != snode and n != node ]))
                 for snode in skill_nodes
            )

            master_node = max(l, key=lambda x: x[1])[0]
            #print(node.content.name,master_node.content.name )

            tree_bases = sorted([ n for n in skill_nodes if n != node and n != master_node and n != novice_node ], key=lambda x: x.content.pos)
            #print(node.content.name, [ t.content.name for  t in tree_bases])

            trees = []
            for tree_base in tree_bases:
                tree = list(tree_base.walk(converter=lambda x: x.content))
                trees.append(tree)

            category = novice_node.getRootParent().content.name
            print (category)
            profession['trees'] = trees
            profession['novice'] = novice_node.content
            profession['master'] = master_node.content
            profession['graph_type'] = novice_node.content.graph_type
            profession['category'] = category
            professions[profession['name']] = profession

        return professions



        #for skill in self.root.walk(converter=lambda x: x.content):
        #    if type(skill) == str:
        #        continue
        #    parent = skill.parent
        #    if parent:
        #        parent = parent.name
        #    else:
        #        parent = None
        #    skills[skill.name] = {
        #        'parent': parent,
        #        'skills_required': [s.name for s in skill.skills_required ],
        #        'mods': skill.skill_mods
        #    }
        #print(skills)


import json

class SkillEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, Skill):
            return {
                'name': obj.name,
                'skills_required': [o.name for o in obj.skills_required],
                'mods': obj.skill_mods,
                'xp_type': obj.XP_TYPE,
                'xp_cost': int(obj.XP_COST),
                'credit_cost': obj.MONEY_REQUIRED,
                'skillpoint_cost': int(obj.POINTS_REQUIRED),
            }


        return json.JSONEncoder.default(self, obj)



def main():
    import argparse


    parser = argparse.ArgumentParser()
    parser.add_argument('inputcsv')

    args = parser.parse_args()

    if not args.inputcsv:
        parser.print_help()
        return

    reader = Reader(args.inputcsv)

    skills = reader.items()

    professionGraph = ProfessionGraph()
    for skill in skills[:]:
        professionGraph.addSkill(skill)
    #print(professionGraph.root)
    professionGraph.resolveRequierments()
    professions = professionGraph.generateProfessions()

    output = json.dumps(professions, cls=SkillEncoder)

    open('skills.json','w').write(output)


if __name__ == "__main__":
    main()
