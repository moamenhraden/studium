#pakete importieren : 
from graphviz import Graph
import numpy as np 

# Klassen Definition : 
class ANDNODE :
    def __init__(self, name):
        self.name = name 
        self.nodes = []

    def add(self, node):
        self.nodes.append(node)
        return 
    
    def topdown(self,mat):
        for node in self.nodes :
            matrix=[]
            erg = node.topdown([])
            if any([type(i)!=list for i in erg ]) or len(erg) == 0 : 
                    erg = [erg]
            if any([type(i)!=list for i in mat ]) or len(mat) == 0 : 
                    mat = [mat]
            for zeile in erg : 
                for zeile2 in mat : 
                    matrix.append(zeile+zeile2)   
            mat = matrix 
        return mat        
    





class ORNODE:
    def __init__(self, name): 
        self.name = name 
        self.nodes = [] 
    
    def add(self, node ) : 
        self.nodes.append(node)
        return 
    
    def topdown(self,mat):
        for node in self.nodes: 
            mat.append(node.topdown([])) 
        return mat
            






class EVENT:
    name = ''
    def __init__(self, name):
        self.name = name
    
    def topdown(self,mat):
        mat.append(self.name)
        return mat
#--------------------------------------------------------
#--------------------------------------------------------

# FehlerBaum automatisch erstellen : 
g = Graph(name='Fehlerbaum' , filename='fb' )
g.node_attr['shape'] = 'square'
def ausgabe(var):
    if type(var) == EVENT or var.nodes == [] : 
        var_typename = type(var).__name__
        g.node( var_typename+ '\n' + var.name)
    else : 
        for i in var.nodes :
            var_typename = type(var).__name__
            i_typename2=type(i).__name__
            g.edge(var_typename+'\n' + var.name, i_typename2+'\n' +i.name)
            ausgabe(i)
    return g


#-----------------------------------------------------------
#-----------------------------------------------------------
# objekte erstellen : 

TOP = ANDNODE("TOP")
c = ANDNODE("c")
a = ORNODE("a")
b = ORNODE('b')
d = ORNODE('d')
e1 = EVENT("1")
e2 = EVENT("2")
e3 = EVENT("3")
e4 = EVENT("4")
e5 = EVENT("5")
e6 = EVENT("6")



TOP.add(a)
a.add(d)
a.add(c)
a.add(b)

c.add(e1)
c.add(e2)
b.add(e3)
b.add(e4)
d.add(e5)
d.add(e6)


# matrix :

print(TOP.topdown([]))
#ausführen: 
ausgabe(TOP)
g.view()
