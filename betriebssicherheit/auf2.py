#******************************************************
#           import packages 
#******************************************************
from graphviz import Graph


#*******************************************************
#               statnode
#*******************************************************

class STATENODE : 
    def __init__(self,name):
        self.name = name 
        self.nodes = []
        self.xors =[]
        self.parentattr = None
        self.prop = 0  #--Probability


    def add(self, node , prop):
        node.prop = prop 
        node.parentattr = self 
        self.nodes.append(node)
        return 

    def getprop(self,l) : 
        if self.parentattr == None :
            l.append('p(' + self.name + ')')
            erg = self.prop
            return erg
        else : 
            l.append('p(' + self.name + '|' + self.parentattr.name + ')' )
            erg = self.prop * self.parentattr.getprop(l)
        return erg
    def graph(self, g):
        if(self.nodes != []) and type(self) == STATENODE:

            # der inhalt des knotens
            s = ' {  <0>  | { '
            for node in self.nodes:
                if (type(node) == STATENODE):
                    s += '<' + node.name + '>' + node.name +'('+ str(node.prop)+')' +'|'
            s = s[:-1]
            s += '}}'

            # erstellen des knotens
            g.node(self.name, s)

            #knoten verbinden
            if (self.parentattr != None) :  
                g.edge(self.parentattr.name+':'+self.name, self.name)

        # rekursive aufruf 
        for node in self.nodes:
                node.graph(g)



#****************************************************
#              xor
#****************************************************
class XORNODE : 
    def __init__(self,name): 
        self.name = name 
        self.nodes = []

    def add(self, node) :
        if node.nodes != [] : 
            print("es dürfen nur Blätter angehängt werden !")
            return
        self.nodes.append(node)
        node.xors.append(self)
        return len(self.nodes)

    def getname(self) : 
        return self.name

    def getprop(self,l ):
        prop= 0
        for i in self.nodes :
            l_i = []
            prop += i.getprop(l_i)
            l.append(l_i)
        return prop
    def graph(self, g):
        if type(self) == XORNODE:
                 s = '=1'
                 g.node(self.name, s)
        for node in self.nodes:
           g.edge(node.parentattr.name+ ':'+ node.name , self.name)


#****************************************************
#         wahrscheilichkeit rechnungsweg 
#****************************************************
def getPorpOperation(l): 
    s='' ;a = 0 
    # if xor node operation 
    if any([type(i)== list for i in l]): 
        for i in l : 
            b = 0 
            for j in i : 
                if b < len(i)-1:
                    s+= j + ' * '
                else : 
                    s += j 
                b += 1
            if a != len(l)-1 : 
                s += ' + '
            a+=1
    else : 
        for i in l : 
            if a < len(l)-1 :
                s += i + ' * '
            else : 
                s += i 
            a+= 1
    print(s)
    return



# ****************************************************
#           ausfuehren : 
#*****************************************************
        
Z0 = STATENODE('Z0')
Z1 = STATENODE('Z1')
Z2 = STATENODE('Z2') 
Z3 = STATENODE('Z3')
Z4 = STATENODE('Z4')
Z5 = STATENODE('Z5')
Z6 = STATENODE('Z6')
Z7 = STATENODE('Z7')
Z8 = STATENODE('Z8')
Z0.prop= 0.3
Z0.add(Z1,0.3)
Z0.add(Z2,0.7)
Z1.add(Z3,0.9)
Z1.add(Z4, 0.3)
Z2.add(Z5, 0.5)
Z2.add(Z6,0.2)
a = XORNODE('a')
a.add(Z6)
a.add(Z3)
l1=[]
print(Z3.getprop(l1))
l2=[]
print(Z6.getprop(l2))
l3=[]
print(a.getprop(l3))
getPorpOperation(l1)
getPorpOperation(l2)
getPorpOperation(l3)


g= Graph('structs',node_attr={'shape': 'record'}) 
g.attr(rankdir='LR')
Z0.graph(g)
a.graph(g)
g.view()

