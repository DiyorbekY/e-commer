// E-commerce loyihasi uchun asosiy JavaScript

$(document).ready(function() {
    // Navbar scroll effect
    $(window).scroll(function() {
        if ($(this).scrollTop() > 50) {
            $('.navbar').addClass('navbar-scrolled');
        } else {
            $('.navbar').removeClass('navbar-scrolled');
        }
    });

    // Product card hover effects
    $('.product-card').hover(
        function() {
            $(this).find('.product-image-placeholder').addClass('hover-effect');
        },
        function() {
            $(this).find('.product-image-placeholder').removeClass('hover-effect');
        }
    );

    // Flash sale countdown timer
    function updateCountdown() {
        $('.flash-sale-timer').each(function() {
            const endTime = $(this).data('end-time');
            if (endTime) {
                const now = new Date().getTime();
                const distance = new Date(endTime).getTime() - now;

                if (distance > 0) {
                    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
                    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

                    $(this).text(`${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')} qoldi`);
                } else {
                    $(this).text('Tugadi');
                    $(this).closest('.flash-sale-badge').addClass('expired');
                }
            }
        });
    }

    // Update countdown every second
    setInterval(updateCountdown, 1000);
    updateCountdown();

    // Search functionality
    let searchTimeout;
    $('#searchInput').on('input', function() {
        const query = $(this).val();

        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(function() {
            if (query.length >= 2) {
                performSearch(query);
            } else {
                $('#searchSuggestions').hide();
            }
        }, 300);
    });

    function performSearch(query) {
        // AJAX search request
        $.ajax({
            url: '/api/products/',
            data: { search: query },
            success: function(data) {
                displaySearchSuggestions(data.results);
            },
            error: function() {
                console.log('Qidiruv xatosi');
            }
        });
    }

    function displaySearchSuggestions(products) {
        const suggestions = $('#searchSuggestions');
        suggestions.empty();

        if (products.length > 0) {
            products.slice(0, 5).forEach(function(product) {
                const suggestion = $(`
                    <div class="search-suggestion" data-product-id="${product.id}">
                        <div class="d-flex align-items-center">
                            <div class="suggestion-image me-3">
                                <i class="fas fa-box text-muted"></i>
                            </div>
                            <div>
                                <div class="suggestion-title">${product.name}</div>
                                <div class="suggestion-price text-primary">$${product.price}</div>
                            </div>
                        </div>
                    </div>
                `);
                suggestions.append(suggestion);
            });
            suggestions.show();
        } else {
            suggestions.hide();
        }
    }

    // Click outside to hide search suggestions
    $(document).click(function(e) {
        if (!$(e.target).closest('.search-container').length) {
            $('#searchSuggestions').hide();
        }
    });

    // Product filtering
    $('.filter-checkbox').click(function() {
        $(this).toggleClass('checked');
        updateFilters();
    });

    $('.price-input').on('change', function() {
        updateFilters();
    });

    function updateFilters() {
        const filters = {
            categories: [],
            min_price: $('#minPrice').val(),
            max_price: $('#maxPrice').val()
        };

        $('.filter-checkbox.checked').each(function() {
            filters.categories.push($(this).data('category-id'));
        });

        // Apply filters
        applyFilters(filters);
    }

    function applyFilters(filters) {
        // Show loading
        $('.product-grid').addClass('loading');

        // AJAX request to filter products
        $.ajax({
            url: '/api/products/',
            data: filters,
            success: function(data) {
                updateProductGrid(data.results);
                updatePagination(data);
            },
            error: function() {
                showNotification('Filtrlashda xatolik yuz berdi', 'error');
            },
            complete: function() {
                $('.product-grid').removeClass('loading');
            }
        });
    }

    function updateProductGrid(products) {
        const grid = $('.product-grid');
        grid.empty();

        if (products.length > 0) {
            products.forEach(function(product) {
                const productCard = createProductCard(product);
                grid.append(productCard);
            });
        } else {
            grid.append(`
                <div class="col-12">
                    <div class="empty-state">
                        <i class="fas fa-search empty-icon"></i>
                        <h3 class="empty-title">Mahsulot topilmadi</h3>
                        <p class="empty-description">Qidiruv shartlaringizni o'zgartiring yoki filtrlarni tozalang.</p>
                    </div>
                </div>
            `);
        }
    }

    function createProductCard(product) {
        return $(`
            <div class="col-lg-4 col-md-6 mb-4 fade-in">
                <div class="card product-card h-100">
                    <div class="card-body">
                        <h5 class="card-title">${product.name}</h5>
                        <p class="card-text text-muted">${product.description.substring(0, 100)}...</p>
                        <div class="d-flex justify-content-between align-items-center mb-3">
                            <span class="fw-bold text-primary">$${product.price}</span>
                            ${product.avg_rating ? `
                                <div class="rating-stars">
                                    ${generateStars(product.avg_rating)}
                                    <small class="text-muted ms-1">(${product.avg_rating})</small>
                                </div>
                            ` : ''}
                        </div>
                    </div>
                    <div class="card-footer bg-transparent">
                        <a href="/products/${product.id}/" class="btn btn-primary w-100">
                            <i class="fas fa-eye me-2"></i>Batafsil
                        </a>
                    </div>
                </div>
            </div>
        `);
    }

    function generateStars(rating) {
        let stars = '';
        for (let i = 1; i <= 5; i++) {
            if (i <= rating) {
                stars += '<i class="fas fa-star"></i>';
            } else {
                stars += '<i class="far fa-star"></i>';
            }
        }
        return stars;
    }

    // Rating system
    $('.rating-input').click(function() {
        const rating = $(this).data('rating');
        const container = $(this).closest('.rating-container');

        container.find('.rating-input').removeClass('active');
        for (let i = 1; i <= rating; i++) {
            container.find(`[data-rating="${i}"]`).addClass('active');
        }

        container.find('input[name="rating"]').val(rating);
    });

    // Review form submission
    $('#reviewForm').submit(function(e) {
        e.preventDefault();

        const formData = $(this).serialize();
        const submitBtn = $(this).find('button[type="submit"]');

        submitBtn.prop('disabled', true).html('<i class="fas fa-spinner fa-spin me-2"></i>Yuklanmoqda...');

        $.ajax({
            url: $(this).attr('action'),
            method: 'POST',
            data: formData,
            success: function(response) {
                showNotification('Sharh muvaffaqiyatli qo\'shildi!', 'success');
                $('#reviewForm')[0].reset();
                $('.rating-input').removeClass('active');
                loadReviews();
            },
            error: function() {
                showNotification('Sharh qo\'shishda xatolik yuz berdi', 'error');
            },
            complete: function() {
                submitBtn.prop('disabled', false).html('<i class="fas fa-paper-plane me-2"></i>Yuborish');
            }
        });
    });

    // Load more reviews
    $('#loadMoreReviews').click(function() {
        const page = $(this).data('page');
        const productId = $(this).data('product-id');

        $(this).html('<i class="fas fa-spinner fa-spin me-2"></i>Yuklanmoqda...');

        $.ajax({
            url: `/api/products/${productId}/reviews/`,
            data: { page: page },
            success: function(data) {
                appendReviews(data.results);

                if (data.next) {
                    $('#loadMoreReviews').data('page', page + 1);
                } else {
                    $('#loadMoreReviews').hide();
                }
            },
            error: function() {
                showNotification('Sharhlarni yuklashda xatolik', 'error');
            },
            complete: function() {
                $('#loadMoreReviews').html('<i class="fas fa-plus me-2"></i>Ko\'proq ko\'rish');
            }
        });
    });

    // Wishlist functionality
    $('.wishlist-btn').click(function(e) {
        e.preventDefault();

        const productId = $(this).data('product-id');
        const btn = $(this);

        $.ajax({
            url: '/api/wishlist/toggle/',
            method: 'POST',
            data: { product_id: productId },
            headers: {
                'X-CSRFToken': $('[name=csrfmiddlewaretoken]').val()
            },
            success: function(response) {
                if (response.added) {
                    btn.addClass('active').html('<i class="fas fa-heart"></i>');
                    showNotification('Sevimlilar ro\'yxatiga qo\'shildi', 'success');
                } else {
                    btn.removeClass('active').html('<i class="far fa-heart"></i>');
                    showNotification('Sevimlilar ro\'yxatidan olib tashlandi', 'info');
                }
            },
            error: function() {
                showNotification('Xatolik yuz berdi', 'error');
            }
        });
    });

    // Cart functionality
    $('.add-to-cart').click(function(e) {
        e.preventDefault();

        const productId = $(this).data('product-id');
        const quantity = $('#quantity').val() || 1;
        const btn = $(this);

        btn.prop('disabled', true).html('<i class="fas fa-spinner fa-spin me-2"></i>Qo\'shilmoqda...');

        $.ajax({
            url: '/api/cart/add/',
            method: 'POST',
            data: {
                product_id: productId,
                quantity: quantity
            },
            headers: {
                'X-CSRFToken': $('[name=csrfmiddlewaretoken]').val()
            },
            success: function(response) {
                showNotification('Mahsulot savatga qo\'shildi!', 'success');
                updateCartCount(response.cart_count);

                // Show cart preview
                showCartPreview(response.cart_items);
            },
            error: function(xhr) {
                if (xhr.status === 401) {
                    showNotification('Savatga qo\'shish uchun tizimga kiring', 'warning');
                } else {
                    showNotification('Xatolik yuz berdi', 'error');
                }
            },
            complete: function() {
                btn.prop('disabled', false).html('<i class="fas fa-shopping-cart me-2"></i>Savatga qo\'shish');
            }
        });
    });

    // Notification system
    function showNotification(message, type = 'info') {
        const notification = $(`
            <div class="alert alert-${type} alert-dismissible fade show notification" role="alert">
                ${message}
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            </div>
        `);

        $('#notifications').append(notification);

        // Auto remove after 5 seconds
        setTimeout(function() {
            notification.fadeOut(function() {
                $(this).remove();
            });
        }, 5000);
    }

    // Smooth scrolling
    $('a[href^="#"]').click(function(e) {
        e.preventDefault();

        const target = $($(this).attr('href'));
        if (target.length) {
            $('html, body').animate({
                scrollTop: target.offset().top - 100
            }, 500);
        }
    });

    // Image lazy loading
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.remove('lazy');
                observer.unobserve(img);
            }
        });
    });

    document.querySelectorAll('img[data-src]').forEach(img => {
        imageObserver.observe(img);
    });

    // Form validation
    $('form').submit(function(e) {
        const form = $(this);
        let isValid = true;

        form.find('[required]').each(function() {
            const field = $(this);
            const value = field.val().trim();

            if (!value) {
                field.addClass('is-invalid');
                isValid = false;
            } else {
                field.removeClass('is-invalid');
            }
        });

        if (!isValid) {
            e.preventDefault();
            showNotification('Iltimos, barcha majburiy maydonlarni to\'ldiring', 'warning');
        }
    });

    // Price formatting
    $('.price').each(function() {
        const price = parseFloat($(this).text());
        $(this).text('$' + price.toFixed(2));
    });

    // Tooltip initialization
    $('[data-bs-toggle="tooltip"]').tooltip();

    // Modal handling
    $('.modal').on('show.bs.modal', function() {
        $('body').addClass('modal-open');
    });

    $('.modal').on('hidden.bs.modal', function() {
        $('body').removeClass('modal-open');
    });

    // Back to top button
    const backToTop = $('<button class="btn btn-primary back-to-top"><i class="fas fa-arrow-up"></i></button>');
    $('body').append(backToTop);

    $(window).scroll(function() {
        if ($(this).scrollTop() > 300) {
            backToTop.fadeIn();
        } else {
            backToTop.fadeOut();
        }
    });

    backToTop.click(function() {
        $('html, body').animate({ scrollTop: 0 }, 500);
    });

    // Initialize animations
    function initAnimations() {
        $('.fade-in').each(function(index) {
            $(this).delay(index * 100).queue(function() {
                $(this).addClass('animated').dequeue();
            });
        });
    }

    // Call animations on page load
    initAnimations();

    // Reinitialize animations on AJAX content load
    $(document).ajaxComplete(function() {
        initAnimations();
    });
});

// Utility functions
function formatPrice(price) {
    return '$' + parseFloat(price).toFixed(2);
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('uz-UZ');
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    }
}

// Export functions for use in other scripts
window.ecommerce = {
    showNotification,
    formatPrice,
    formatDate,
    debounce,
    throttle
};