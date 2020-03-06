import cv2
import imutils
import numpy as np
class myclass: 
    def __init__(self, imagename) : 
        #bild lesen   
        self.image = cv2.imread(imagename)
        # bild spiegelung 
        image_v = cv2.flip(self.image , 0)
        self.image = cv2.vconcat([image_v, self.image, image_v])
        image_h = cv2.flip(self.image, 1)
        self.image = cv2.hconcat([image_h, self.image, image_h])
        # variablen : 
        self.p1 = np.array([10, 10 ]) ; self.p2 = np.array([100, 100 ])
        self.index= 0 
        self.copy = self.image.copy()
    
    def save(self):
        output = imutils.rotate(self.image, self.index)
        center = (self.p1 + self.p2) // 2 
        a = center + [5, 0] ; b = center - [5, 0] 
        c = center + [0, 5] ; d = center - [0, 5]
        output = cv2.rectangle(output,tuple(self.p1) , tuple(self.p2)  , (0,0,255), 1)
        output = cv2.line(output,tuple(a) , tuple(b) ,(0,0,255),1)
        output = cv2.line(output, tuple(c) , tuple(d) , (0,0,255),1 )
        cv2.imshow("myW" , output)
        

    def increase(self): 
        self.p1 -= 1 ;  self.p2 += 1 
        self.save() 

    def decrease(self): 
        self.p1 += 1 ; self.p2 -= 1 
        self.save() 

    def up(self) : 
        self.p1[1] -= 1 ; self.p2[1] -= 1
        self.save() 

    def down(self): 
        self.p1[1] += 1 ; self.p2[1] += 1
        self.save() 

    def left(self): 
        self.p1[0] -= 1 ; self.p2[0] -= 1 
        self.save()

    def right(self): 
        self.p1[0] += 1 ; self.p2[0] += 1
        self.save()

    def rotate_l(self):
        self.index += 1
        self.save()

    def rotate_r(self):
        self.index -= 1 
        self.save()
        
    def schneiden(self, filename):
        image = imutils.rotate(self.copy, self.index)
        x1 = self.p1[0]; y1 = self.p1[1]
        x2 = self.p2[0]  ; y2 = self.p2[1]
        geschnitten = image[x1:x2 , y1:y2]
        cv2.imwrite(filename ,geschnitten)
        return geschnitten
        
    def ausgabe(self) : 
        self.save()
        while True : 
            k = cv2.waitKey(0)
            if k == ord('l'):
                self.rotate_l()

            elif k== ord('r'):
                self.rotate_r()

            elif k == ord('d'):
                self.right()

            elif k== ord('a') : 
                self.left()

            elif k== ord('w') : 
                self.up()

            elif k== ord('x') : 
                self.down()
            elif k==43 : 
                self.increase()
            elif k==45 : 
                self.decrease()
            elif k==ord("s"):
                filename = input("geben Sie der Filename : ")
                self.schneiden(filename)
            elif k== ord("q"):
                cv2.destroyAllWindows()
                break
            else : 
                pass
p = myclass("image.jpg")
p.ausgabe()
