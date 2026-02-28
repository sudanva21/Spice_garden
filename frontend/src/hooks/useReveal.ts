import { useEffect, useRef, useCallback } from 'react';

export function useReveal() {
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('visible');
                    }
                });
            },
            { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
        );

        // Observe the element itself and any children with reveal classes
        const revealEls = el.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale');
        revealEls.forEach(child => observer.observe(child));

        // Also observe the parent if it has a reveal class
        if (el.classList.contains('reveal') || el.classList.contains('reveal-left') || el.classList.contains('reveal-right') || el.classList.contains('reveal-scale')) {
            observer.observe(el);
        }

        return () => observer.disconnect();
    }, []);

    return ref;
}

// Hook to observe ALL reveal elements within any container
export function usePageReveal() {
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('visible');
                    }
                });
            },
            { threshold: 0.08, rootMargin: '0px 0px -50px 0px' }
        );

        // Small delay to let DOM render
        const timer = setTimeout(() => {
            const revealEls = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale');
            revealEls.forEach(el => observer.observe(el));
        }, 100);

        return () => {
            clearTimeout(timer);
            observer.disconnect();
        };
    }, []);
}

// Counter animation hook
export function useCounter(target: number, duration: number = 2000) {
    const ref = useRef<HTMLSpanElement>(null);
    const hasAnimated = useRef(false);

    const animate = useCallback(() => {
        if (hasAnimated.current || !ref.current) return;
        hasAnimated.current = true;
        const start = performance.now();
        const step = (now: number) => {
            const progress = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
            if (ref.current) ref.current.textContent = Math.floor(eased * target).toString();
            if (progress < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
    }, [target, duration]);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const observer = new IntersectionObserver(
            ([entry]) => { if (entry.isIntersecting) animate(); },
            { threshold: 0.5 }
        );
        observer.observe(el);
        return () => observer.disconnect();
    }, [animate]);

    return ref;
}
