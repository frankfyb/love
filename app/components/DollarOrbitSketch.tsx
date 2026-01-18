"use client";

import React from "react";
import { ReactP5Wrapper, Sketch } from "react-p5-wrapper";

interface MySketchProps {
    customImage?: string | null;
    backgroundImage?: string | null;
}

const sketch: Sketch<MySketchProps> = (p5) => {
    let catImg: any;
    let dollarImg: any;
    let customImg: any = null;
    let useUrl: string | null = null;
    let bgImg: any = null;
    let useBgUrl: string | null = null;

    const dollars: Dollar[] = [];
    const numDollars = 400;

    class Dollar {
        pos: any;
        rot: any;
        rotVel: any;
        angle: number;
        radius: number;
        y: number;
        speed: number;

        constructor() {
            // Initialize properties
            this.angle = p5.random(p5.TWO_PI);
            this.radius = 0;
            this.y = 0;
            this.speed = 0;
            this.pos = p5.createVector(0, 0, 0);
            this.rot = p5.createVector(0, 0, 0);
            this.rotVel = p5.createVector(0, 0, 0);

            this.reset(true);
        }

        reset(initial = false) {
            this.angle = p5.random(p5.TWO_PI);

            // Torus/Vortex distribution
            // Heavier concentration in a ring, but with vertical spread
            this.radius = p5.random(200, 450);

            // Vertical spread - can be taller
            this.y = p5.random(-350, 350);

            // Speed - closer is faster?
            this.speed = p5.random(0.01, 0.03);

            this.pos.set(
                p5.cos(this.angle) * this.radius,
                this.y,
                p5.sin(this.angle) * this.radius
            );

            this.rot.set(p5.random(p5.TWO_PI), p5.random(p5.TWO_PI), p5.random(p5.TWO_PI));
            this.rotVel.set(p5.random(-0.05, 0.05), p5.random(-0.05, 0.05), p5.random(-0.05, 0.05));
        }

        update() {
            this.angle += this.speed;

            // Spiral down effect or up? 
            // Let's make them flow delicately
            this.y -= 0.8; // Slowly rising or falling

            // Vortex tightening? No, standard cylinder orbit is fine.

            // Apply position
            // Add a "breath" to the radius
            let r = this.radius + p5.sin(p5.frameCount * 0.02 + this.y * 0.01) * 30;

            this.pos.x = p5.cos(this.angle) * r;
            this.pos.z = p5.sin(this.angle) * r;

            // Bobbing y slightly independent of flow
            // this.pos.y = this.y + sin(...) // redundant if we move y directly

            this.rot.add(this.rotVel);

            // Wrapper
            if (this.y < -400) {
                this.y = 400;
                this.radius = p5.random(200, 450); // Reseed radius
            }
        }

        draw() {
            p5.push();
            // Depth sorting is manual in p5 WEBGL sometimes, but z-buffer handles opacity overlap poorly
            // But opaque objects are fine.
            p5.translate(this.pos.x, this.y, this.pos.z);

            p5.rotateX(this.rot.x);
            p5.rotateY(this.rot.y);
            p5.rotateZ(this.rot.z);

            if (dollarImg) {
                p5.texture(dollarImg);
                p5.plane(80, 35);
            } else {
                p5.fill(100, 200, 100);
                p5.plane(80, 35);
            }
            p5.pop();
        }
    }

    p5.preload = () => {
        catImg = p5.loadImage("/cat_texture.png");
    };

    p5.setup = () => {
        p5.createCanvas(800, 600, p5.WEBGL);

        // Improved procedural dollar texture
        let g = p5.createGraphics(300, 130);
        g.background(133, 187, 101); // Dollar green

        // Border
        g.noFill();
        g.stroke(255);
        g.strokeWeight(8);
        g.rect(10, 10, 280, 110);

        // Inner details - mimic money pattern
        g.strokeWeight(1);
        g.stroke(255, 100);
        for (let i = 0; i < 300; i += 10) {
            g.line(i, 0, i + 20, 130);
        }

        // Text
        g.fill(255);
        g.noStroke();
        g.textSize(70);
        g.textStyle(p5.BOLD);
        g.textAlign(p5.CENTER, p5.CENTER);
        g.text("$", 40, g.height / 2);
        g.text("$", g.width - 40, g.height / 2);

        g.textSize(30);
        g.text("UNITED STATES", g.width / 2, 30);
        g.textSize(40);
        g.text("ONE DOLLAR", g.width / 2, 80);

        // Portrait circle
        g.noFill();
        g.stroke(255);
        g.strokeWeight(2);
        g.ellipse(g.width / 2, g.height / 2, 60, 70);

        dollarImg = g;

        for (let i = 0; i < numDollars; i++) {
            dollars.push(new Dollar());
        }
    };

    p5.updateWithProps = (props: MySketchProps) => {
        if (props.customImage && props.customImage !== useUrl) {
            useUrl = props.customImage;
            p5.loadImage(props.customImage, (img) => {
                customImg = img;
            });
        }
        if (props.backgroundImage && props.backgroundImage !== useBgUrl) {
            useBgUrl = props.backgroundImage;
            p5.loadImage(props.backgroundImage, (img) => {
                bgImg = img;
            });
        }
    };

    p5.draw = () => {
        p5.background(10, 10, 30);

        // Draw Background Plane
        if (bgImg) {
            p5.push();
            // Reset matrices for background to be purely 2D-like or fixed 3D?
            // Let's put it far back in 3D space
            const zDepth = -800;
            p5.translate(0, 0, zDepth);
            p5.texture(bgImg);
            // Calculate size to fill frustum at this depth
            // fov = PI/3 usually. 
            // height = 2 * dist * tan(fov/2)
            // approx tan(PI/6) = 0.577
            // h = 2 * 800 * 0.577 = 923.
            // Let's make it plenty big
            let ratio = bgImg.width / bgImg.height;
            let w = 2000 * ratio;
            let h = 2000;
            if (w < 2000) { w = 2000; h = 2000 / ratio; }

            p5.plane(w, h);
            p5.pop();
        }

        p5.orbitControl();

        p5.ambientLight(150);
        p5.pointLight(255, 255, 255, 0, -300, 300);
        p5.directionalLight(255, 255, 255, 0, 1, -1);

        // Global rotation for the "surround" effect
        // We can rotate the camera view slightly or orbit the scene
        p5.rotateY(p5.frameCount * 0.002);

        // Draw Center Image (Person)
        p5.push();
        p5.noStroke();
        let dispImg = customImg || catImg;
        if (dispImg) {
            p5.texture(dispImg);
            // Counter-rotation to keep facing camera mostly?
            p5.rotateY(p5.frameCount * -0.002);
            p5.plane(200, 200);
        } else {
            p5.fill(200);
            p5.plane(200, 200);
        }
        p5.pop();

        for (const d of dollars) {
            d.update();
            d.draw();
        }
    };
};

export default function DollarOrbitSketch({ customImage, backgroundImage }: { customImage: string | null, backgroundImage?: string | null }) {
    return <ReactP5Wrapper sketch={sketch} customImage={customImage} backgroundImage={backgroundImage} />;
}
