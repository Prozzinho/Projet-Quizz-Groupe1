let currentSlide = 0;
        const slides = document.querySelectorAll('.carousel-slide');
        const totalSlides = slides.length;

        function moveSlide(direction) {
            currentSlide += direction;
            
            if (currentSlide < 0) {
                currentSlide = totalSlides - 1;
            } else if (currentSlide >= totalSlides) {
                currentSlide = 0;
            }
            
            updateCarousel();
        }

        function updateCarousel() {
            const carousel = document.querySelector('.carousel');
            carousel.style.transform = `translateX(-${currentSlide * 100}%)`;
        }

        setInterval(() => {
            moveSlide(1);
        }, 5000);