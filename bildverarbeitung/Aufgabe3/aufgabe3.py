#*********************************************
#                                            #
#            prof: Rembold                   #
#          BildVerarbeitung                  # 
#         stud:  Moamen Hraden               #
#              Aufgabe 3                     #
#                                            #
#********************************************#


#****************************************
#        import packages 
#****************************************
import cv2 as cv 
import matplotlib.pyplot as plt 
import numpy as np 
import os
import time


#****************************************
#        globale variablen
#****************************************
allow = False
threshlding = False
showkontouren = False
counter = 0 

image = cv.imread('image.png')
orginal = image.copy()
anleitungen = cv.imread('anleitungen.jpg')
schwellwert = image.max()/2

matches = []
punkte = []
rect_points = []
contour_list = []
zugeschnitteneBilder = []

pfad = 'Alpha/'
bilderverzeichnis = [i for i in os.listdir(pfad)]
bild_dict={}

weis = np.full(shape=(512,512,3), fill_value=255, dtype=np.float32)
#****************************************
#         referenzBilder
#****************************************
print('\n\n======referenz bilder shapes==========')
for bildname in bilderverzeichnis :
    bildpfad= pfad + bildname
    bild = cv.imread(bildpfad)
    #converted = cv.cvtColor(bild, cv.COLOR_BGR2GRAY)
    bild_dict[bildname[:-4]] = bild   
    print(bild.shape)
#print(bild_dict.keys())
#print(bild_dict.values())

#****************************************
#         functionen
#****************************************

# 1) punkte zeichnen : 
def draw_point(event, x, y, falgs, params):
    global punkte, allow, punkte, image,counter
    if event == cv.EVENT_LBUTTONDOWN : 
            cv.circle(img=image, center=(x,y), radius=2, color=(0, 0 ,255), thickness=2)
            punkte.append([x,y])
            counter +=1
            if counter == 4 :
                draw_polygon()
                allow = True
    return


# 2) plygon zeichnen
def draw_polygon():    
    global punkte, image
    punkte = np.array(punkte)
    punkte.reshape((-1,1,2))
    cv.polylines(img=image, pts=[punkte], isClosed=True, color=(0,0,255), thickness=2)
    return


# 3) punkte in der richtigen Reihenfolge sortieren :
def order_points():   
    global punkte
    rect = np.zeros((4, 2), dtype="float32")       
    s = np.sum(punkte, axis=1)
    rect[0] = punkte[np.argmin(s)] 
    rect[2] = punkte[np.argmax(s)] 
    diff = np.diff(punkte, axis=1)
    rect[1] = punkte[np.argmin(diff)]
    rect[3] = punkte[np.argmax(diff)] 
    punkte = rect
    return 


# 4) die Transformation
def P_transformation():
    global punkte , image ,orginal     
    (tl, tr, br, bl) = punkte
    widthA = np.sqrt(((br[0] - bl[0]) ** 2) + ((br[1] - bl[1]) ** 2))
    widthB = np.sqrt(((tr[0] - tl[0]) ** 2) + ((tr[1] - tl[1]) ** 2))
    maxWidth = max(int(widthA), int(widthB))
    heightA = np.sqrt(((tr[0] - br[0]) ** 2) + ((tr[1] - br[1]) ** 2))
    heightB = np.sqrt(((tl[0] - bl[0]) ** 2) + ((tl[1] - bl[1]) ** 2))
    maxHeight = max(int(heightA), int(heightB))
    dst = np.array([
        [0, 0],
        [maxWidth - 1, 0],
        [maxWidth - 1, maxHeight - 1],
        [0, maxHeight - 1]], dtype="float32")
    M = cv.getPerspectiveTransform(punkte, dst)
    image = cv.warpPerspective(image, M, (maxWidth, maxHeight))
    orginal = image.copy()
    return 


# 5) Thresholding 
def threshold(k):
    global schwellwert , threshlding
    threshlding = True
    if k == ord('+'):
        schwellwert += 10 
    elif k == ord('-'):
        schwellwert -=10 
    return 


# 6) glätten (rauschen entfernen):
def glätten():
    global image
    image = cv.GaussianBlur(image , (5 , 5) , 0)
    

# 7) extractContours : 
def extractContours():
    global image, schwellwert,weis, showkontouren,contour_list
    image =cv.cvtColor(image, cv.COLOR_BGR2GRAY)
    _, image = cv.threshold(image, schwellwert , image.max(), cv.THRESH_BINARY)   
    contours ,_ = cv.findContours(image , cv.RETR_TREE , cv.CHAIN_APPROX_NONE)
    sorted_contours = sorted(contours , key = cv.contourArea , reverse = True)
    #contours = contours[1:]
    # TODO: die größte kontour mit cv.contourArea() function entfernen
    for contour in contours : 
        if (cv.contourArea(contour) > 400) and (cv.contourArea(contour) < 2000): 
            contour_list.append(contour)
    weis = cv.resize(weis , (image.shape[1], image.shape[0]))
    cv.drawContours(weis,contour_list ,-1 , (255,0,0),2)
    showkontouren = True
    return

# 8) rechtecke zeichnen :
def rectangles():
    global contour_list , image, orginal,weis, rect_points
    for contour in contour_list : 
        x , y , w , h = cv.boundingRect(contour)
        rect_points.append([x,y,w,h])
        cv.rectangle(weis, (x , y ), (x+w , y+h), (0,0,255) ,1 )
        cv.rectangle(orginal, (x , y ), (x+w , y+h), (0,0,255) ,1 )


# 9) die bilder in den rechtecken schneiden :
def zuschneiden():
    global orginal, rect_points, zugeschnitteneBilder
    print('\n\n========zugeschnittene bilder shapes=============')
    for point in rect_points :
        x , y , w , h = point 
        zugeschnitten = orginal[y:y+h , x:x+w]
        zugeschnitten = cv.resize(zugeschnitten, (24, 42))
        print(zugeschnitten.shape)
        zugeschnitteneBilder.append(zugeschnitten) 
    

# 10) zugeschnittene bilder  mit den referenzbilder vergleichen : 
def match():
    global  zugeschnitteneBilder, matches,bild_dict
    keys = list(bild_dict.keys())
    for i in zugeschnitteneBilder :
        for j in keys : 
            res = cv.matchTemplate(i, bild_dict[j] , cv.TM_CCOEFF_NORMED )
            minval, maxval , _ , _ = cv.minMaxLoc(res)
            #print((minval, maxval))
            if minval < -0.63 :
                print('true')           
                matches.append(j)
    print('end of matching')


# 11)  bilder namen lesen und ausgeben :
def outputText():
    global matches
    matches.reverse()
    s= ''.join(matches)
    print(s)
    return s


# 12) Ausgabe : 
def ausgabe(): 
    global image, threshlding, orginal, weis , showkontouren
    copy = image.copy()
    if threshlding : 
        ret , copy = cv.threshold(copy, schwellwert , image.max(), cv.THRESH_BINARY) 
    if showkontouren : 
        cv.imshow('kontouren' , weis)
    cv.imshow('mywindow',copy) 
    cv.imshow('orginal', orginal) 
    cv.imshow('anleitungen', anleitungen)


#****************************************
#         Ausfuehren 
#**************************************** 
cv.namedWindow('mywindow')
cv.setMouseCallback('mywindow', draw_point)
while True :
    k= cv.waitKey(1)
    ausgabe() 
    if k == ord('q') : 
        break
    elif k== ord('k'):
        extractContours()
    elif k== ord('t'):
        order_points()
        P_transformation()
    elif k== ord('g'):
        glätten()
    elif k== ord('+'):
        threshold(k)
    elif k== ord('-'):
        threshold(k)
    elif k==ord('r'): 
        rectangles()
    elif k==ord('s'):
        zuschneiden()
    elif k== ord('m'):
        match()
    elif k== ord('x'):
        outputText()
cv.destroyAllWindows() 
        
    
    




    