#*******************************************
#      import packages
#*******************************************
import numpy as np
from functools import reduce
import operator
from graphviz import Digraph


#******************************************
#            STATE
#******************************************
class STATE:
    def __init__(self,name,num):
        self.name=name
        self.num=num
        return

#******************************************
#            TRANSITION
#******************************************
class  TRANSITION:
    def __init__(self,source,destination,name, rate):
        self.source = source
        self.destination = destination
        self.name = name
        self.rate = rate
        return

#******************************************
#            MARKOV
#******************************************
class MARKOV:
    def __init__(self, name, dt=1.0):
        self.states=[]
        self.transitions = []
        self.name = name

    def state(self,state):
        self.states.append(state)

    def transition(self, transition):
        self.transitions.append(transition)

    def createMatrix(self):
        #matrix erstellen (ausßer diagonale)
        dimension = len(self.states)
        markovMatrix = np.zeros((dimension,dimension), dtype=np.float)
        for transition in self.transitions:
            markovMatrix[transition.source.num, transition.destination.num] = transition.rate
        # diagonale berechnen 
        for x in range(dimension):
            markovMatrix[x,x] = 1-  sum([ i  for i in markovMatrix[x] ])
        return markovMatrix

    def probability(self, vector, markovMatrix):
        if len(vector) == markovMatrix.shape[0]:
            probability = np.dot(vector,markovMatrix)
            return probability
        else : 
            print("ungültige operation")

    def graph(self, g):
        
        # knoten erstellen
        for state in self.states:
            g.node(str(state.num), str(state.num))
        # kanten erstellen 
        for transition in self.transitions:
            g.edge(str(transition.source.num),str(transition.destination.num))



M = MARKOV("markov")
S1 = STATE('S1',0)
S2 = STATE ('S2',1)
S3 = STATE('S3',2)
S4 = STATE('S4',3)
S5 = STATE('S5',4)
S6 = STATE('S6',5)

M.state(S1)
M.state(S2)
M.state(S3)
M.state(S4)
M.state(S5)
M.state(S6)


T12 = TRANSITION(S1,S2,'l12', 1/2)
T13 = TRANSITION(S1, S3, 'l13', 1/2)
T14 = TRANSITION(S1, S4, 'l14', 1/2)
T16 = TRANSITION(S1, S6, 'l16', 1/2)

T23 = TRANSITION(S2, S3, 'l23', 1/2)
T24 = TRANSITION(S2, S4, 'l24', 1/2)
T25 = TRANSITION(S2,S5,'l25',1/2)
T26 = TRANSITION(S2, S6, 'l26', 1/2)

T35 = TRANSITION(S3,S5,'l35', 1/2)
T36 = TRANSITION(S3, S6, 'l36', 1/2)

T46 = TRANSITION(S4, S6, 'l46', 1/2)

T51 = TRANSITION(S5, S1, 'l51', 1/2)


M.transition(T12)
M.transition(T13)
M.transition(T14)
M.transition(T16)

M.transition(T23)
M.transition(T24)
M.transition(T25)
M.transition(T26)

M.transition(T35)
M.transition(T36)
M.transition(T46)
M.transition(T51)

#****************************************
#      ausfuehrung 
#****************************************
p = [1,0, 0 ,0, 0, 0]
matrix = M.createMatrix()
print("==================================")
print("        markov-matrix             ")
print("===================================")
print(matrix)
prob = M.probability(p, matrix)
print("==================================")
print("Wahrscheinlichkeit eines Zustandes")
print("===================================")
print(prob)

#****************************************
#          graph
#****************************************
g = Digraph(comment='Markov')
g.attr('node', shape='circle')
M.graph(g)
g.view()
