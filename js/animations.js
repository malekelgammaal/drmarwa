document.addEventListener("DOMContentLoaded", () => {
    // 1. Initialize Lenis for Smooth Scrolling
    const lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        direction: 'vertical',
        gestureDirection: 'vertical',
        smooth: true,
        mouseMultiplier: 1,
        smoothTouch: false,
        touchMultiplier: 2,
        infinite: false,
    });

    function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    // 2. Register GSAP ScrollTrigger
    gsap.registerPlugin(ScrollTrigger);

    // Synchronize Lenis with GSAP ScrollTrigger
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => {
        lenis.raf(time * 1000);
    });
    gsap.ticker.lagSmoothing(0, 0);

    // 3. Hero Animations
    const tl = gsap.timeline();
    tl.to(".reveal-scale", {
        opacity: 1,
        scale: 1,
        duration: 1.2,
        ease: "power4.out"
    })
    .to(".reveal-up", {
        opacity: 1,
        y: 0,
        duration: 1,
        stagger: 0.2,
        ease: "power3.out"
    }, "-=0.8");

    // 4. Parallax Aurora Background
    gsap.to(".aurora-bg", {
        yPercent: 30,
        ease: "none",
        scrollTrigger: {
            trigger: ".hero-modern",
            start: "top top",
            end: "bottom top",
            scrub: true
        }
    });

    // 5. 3D Avatar Tilt Effect (Mouse Move)
    const avatar = document.querySelector('.avatar-3d');
    if (avatar) {
        document.querySelector('.hero-modern').addEventListener('mousemove', (e) => {
            const xAxis = (window.innerWidth / 2 - e.pageX) / 25;
            const yAxis = (window.innerHeight / 2 - e.pageY) / 25;
            avatar.style.transform = `rotateY(${xAxis}deg) rotateX(${yAxis}deg)`;
        });
        document.querySelector('.hero-modern').addEventListener('mouseleave', () => {
            avatar.style.transform = `rotateY(0deg) rotateX(0deg)`;
        });
    }

    // 6. Animated Counters (Statistics)
    const counters = document.querySelectorAll('.counter');
    counters.forEach(counter => {
        ScrollTrigger.create({
            trigger: counter,
            start: "top 85%",
            onEnter: () => {
                const target = +counter.getAttribute('data-target');
                const duration = 2; // seconds
                gsap.to(counter, {
                    innerHTML: target,
                    duration: duration,
                    snap: { innerHTML: 1 },
                    ease: "power2.out",
                    onUpdate: function() {
                        counter.innerHTML = '+' + Math.ceil(this.targets()[0].innerHTML);
                    }
                });
            },
            once: true
        });
    });

    // 7. Horizontal Scroll Section
    const horizontalSections = document.querySelectorAll('.horizontal-scroll-wrapper');
    horizontalSections.forEach(wrapper => {
        const container = wrapper.querySelector('.horizontal-scroll-container');
        if (!container) return;
        
        // Calculate scroll width dynamically
        let getScrollWidth = () => container.scrollWidth - window.innerWidth;
        
        gsap.to(container, {
            x: () => -getScrollWidth(),
            ease: "none",
            scrollTrigger: {
                trigger: wrapper,
                start: "top top",
                end: () => "+=" + getScrollWidth(),
                scrub: 1,
                pin: true,
                invalidateOnRefresh: true,
                anticipatePin: 1
            }
        });
    });

    // 8. General Staggered Card Reveals
    const cards = gsap.utils.toArray('.skill-card, .service-card, .course-card, .glass-panel');
    cards.forEach(card => {
        gsap.fromTo(card, 
            { opacity: 0, y: 50 }, 
            { 
                opacity: 1, 
                y: 0, 
                duration: 0.8, 
                ease: "power3.out",
                scrollTrigger: {
                    trigger: card,
                    start: "top 90%",
                    toggleActions: "play none none none"
                }
            }
        );
    });
});
