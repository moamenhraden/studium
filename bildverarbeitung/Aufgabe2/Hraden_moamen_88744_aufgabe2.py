import cv2 as cv 
import numpy as np 
import matplotlib.pyplot as plt #

def kantendetekter(img):
    sobel = np.array([[0,1,0],[1,-4,1],[0,1,0]], dtype="float32")
    gauss = np.array([[1,2,1],[2,4,2],[1,2,1]], dtype="float32")
    img = cv.filter2D(img, -1, sobel)
    img = cv.filter2D(img, -1, gauss)
    return img

def order_points(pts):                             # die punkte in die richtigen Reihenfolge bringen
    rect = np.zeros((4, 2), dtype="float32")       
    s = np.sum(pts, axis=1)
    rect[0] = pts[np.argmin(s)] 
    rect[2] = pts[np.argmax(s)] 
    diff = np.diff(pts, axis=1)
    rect[1] = pts[np.argmin(diff)]
    rect[3] = pts[np.argmax(diff)] 
    return rect

def P_transformation(image, pts):             # die Transformation : polygon => rectangle 
    rect = order_points(pts)
    (tl, tr, br, bl) = rect
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
    M = cv.getPerspectiveTransform(rect, dst)
    warped = cv.warpPerspective(image, M, (maxWidth, maxHeight))
    return warped

def draw_polygon():                          # ein Polygon aus vier punkte zeichnen
    global punkte, img
    punkte = np.array(punkte)
    punkte.reshape((-1,1,2))
    cv.polylines(img=img, pts=[punkte], isClosed=True, color=(0,0,255), thickness=2)

    def draw_point(event, x, y, falgs, params): # die callback-funktion 
        global img, punkte,counter,allow
        if event == cv.EVENT_LBUTTONDOWN : 
            cv.circle(img=img, center=(x,y), radius=2, color=(0, 0 ,255), thickness=2)
            punkte.append([x,y])
            print(punkte)
            counter +=1
            if counter == 4 :
                draw_polygon()
                # davor darf der user 
                # kein rechteck zeichnen
                allow = True
#variablen : 
img= cv.imread('image.jpg')
punkte = []
allow = False 
counter = 0
schwellwert = img.max()/2
allow = False  # allow the transformation to rectangle
cv.namedWindow('mywindow')
cv.imshow('mywindow', img)
cv.setMouseCallback('mywindow', draw_point)
ausgabe = img.copy() # initialisierung
while True : 
    k = cv.waitKey(1)
    cv.imshow('mywindow' , img)
    if k==ord('r') :
        if allow == True : 
            img = P_transformation(img, punkte)
    elif k==ord('d'): 
        img = kantendetekter(img)
    elif k == ord('-') : 
        schwellwert -= 2 
        ret, img = cv.threshold(img, schwellwert , img.max(), cv.THRESH_BINARY)
    elif k == ord('+'):
        schwellwert += 2 
        ret, img = cv.threshold(img, schwellwert, img.max(), cv.THRESH_BINARY)
    elif k == ord("q"):
        break
cv.destroyAllWindows()
