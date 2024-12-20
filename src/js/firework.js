import * as THREE from 'three';

export default class Firework {
    constructor({ x, y }) {
        const isMobile = /Mobi|Android/i.test(navigator.userAgent);
        const count = isMobile ? 20000 + Math.round(Math.random() * 100) : 60000 + Math.round(Math.random() * 3000);
        const velocity = 50 + Math.random() * 1.5;
        const particlesGeometry = new THREE.BufferGeometry();
        this.particles = [];

        for (let i = 0; i < count; i++) {
            const particle = new THREE.Vector3(x, y, -500);
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(1 - 2 * Math.random());

            const vX = velocity * Math.sin(phi) * Math.cos(theta);
            const vY = velocity * Math.sin(phi) * Math.sin(theta);
            const vZ = velocity * Math.cos(phi);

            particle.deltaX = vX;
            particle.deltaY = vY;
            particle.deltaZ = vZ;

            this.particles.push(particle);
        }

        particlesGeometry.setFromPoints(this.particles);

        const textureLoader = new THREE.TextureLoader();
        const texture = textureLoader.load('/assets/textures/particle.png');

        const particlesMaterial = new THREE.PointsMaterial({
            size: 1,
            alphaMap: texture,
            transparent: true,
            depthWrite: false,
            color: new THREE.Color(Math.random(), Math.random(), Math.random()),
            blending: THREE.AdditiveBlending,
        });

        const points = new THREE.Points(particlesGeometry, particlesMaterial);

        this.points = points;
    }

    update() {
        const position = this.points.geometry.attributes.position;

        for (let i = 0; i < this.particles.length; i++) {
            const x = position.getX(i);
            const y = position.getY(i);
            const z = position.getZ(i);

            position.setX(i, x + this.particles[i].deltaX);
            position.setY(i, y + this.particles[i].deltaY);
            position.setZ(i, z + this.particles[i].deltaZ);
        }

        position.needsUpdate = true;
    }
}
