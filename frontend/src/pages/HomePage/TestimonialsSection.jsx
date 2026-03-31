import React from 'react';
import { Star } from 'lucide-react';

function TestimonialsSection() {
  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Marketing Director at TechCorp',
      content: 'Brio transformed how we approach influencer marketing. The AI recommendations are incredibly accurate.',
      rating: 5,
      avatar: 'https://randomuser.me/api/portraits/women/44.jpg'
    },
    {
      name: 'Michael Chen',
      role: 'Founder of GrowthLabs',
      content: 'We reduced our campaign setup time by 80%. The automation features are game-changing.',
      rating: 5,
      avatar: 'https://randomuser.me/api/portraits/men/32.jpg'
    },
    {
      name: 'Emily Rodriguez',
      role: 'Social Media Manager',
      content: 'The analytics dashboard gives us insights we never had before. Absolutely essential tool.',
      rating: 5,
      avatar: 'https://randomuser.me/api/portraits/women/68.jpg'
    },
    {
      name: 'Jason Patel',
      role: 'Head of Digital at BrandWave',
      content: 'Our influencer discovery process is now 10x faster. Brio is a must-have for modern brands.',
      rating: 5,
      avatar: 'https://randomuser.me/api/portraits/men/14.jpg'
    },
    {
      name: 'Laura Simmons',
      role: 'Content Strategist at NovaMedia',
      content: 'The predictive content tools are incredible. They helped us publish at the most effective times.',
      rating: 4,
      avatar: 'https://randomuser.me/api/portraits/women/21.jpg'
    },
    {
      name: 'David Martinez',
      role: 'CEO at MarketLaunch',
      content: 'Brio enabled our small team to run large-scale influencer campaigns effortlessly.',
      rating: 5,
      avatar: 'https://randomuser.me/api/portraits/men/45.jpg'
    },
    {
      name: 'Priya Kapoor',
      role: 'Brand Manager at StyleSphere',
      content: 'The creator matching accuracy is unreal. We found our top-performing influencers through Brio.',
      rating: 4,
      avatar: 'https://randomuser.me/api/portraits/women/55.jpg'
    },
    {
      name: 'James Walker',
      role: 'E-commerce Growth Lead',
      content: 'Affiliate tracking + influencer campaigns in one platform? Perfect combination for scaling revenue.',
      rating: 5,
      avatar: 'https://randomuser.me/api/portraits/men/29.jpg'
    }
  ];

  return (
    <section className="testimonials-showcase-section">
      <div className="testimonials-header">
        <h2 className="testimonials-main-title">What Our Clients Say</h2>
        <p className="testimonials-subtitle">
          Trusted by thousands of brands worldwide to transform their influencer marketing
        </p>
      </div>

      <div className="testimonials-scroll-wrapper">
        <div className="testimonials-scroll-track">
          {[...testimonials, ...testimonials, ...testimonials].map((testimonial, index) => (
            <div key={index} className="testimonial-flip-card">
              <div className="testimonial-flip-inner">
                {/* Front Side */}
                <div className="testimonial-flip-front">
                  <div className="front-header">
                    <div className="front-avatar-wrapper">
                      <img 
                        src={testimonial.avatar} 
                        alt={testimonial.name}
                        className="front-avatar-img"
                      />
                    </div>
                    <div className="front-author-details">
                      <h4 className="front-author-name">{testimonial.name}</h4>
                      <p className="front-author-role">{testimonial.role}</p>
                    </div>
                  </div>
                  
                  <div className="front-rating-display">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={18}
                        fill={i < testimonial.rating ? '#fbbf24' : 'none'}
                        color="#fbbf24"
                        className="rating-star"
                      />
                    ))}
                  </div>
                  
                  <div className="front-hover-hint">
                    <span className="hint-text">Hover to read review</span>
                    {/* <div className="hint-arrow">↓</div> */}
                  </div>
                </div>
                
                {/* Back Side */}
                <div className="testimonial-flip-back">
                  <div className="back-quote-mark">"</div>
                  <p className="back-testimonial-text">{testimonial.content}</p>
                  <div className="back-author-info">
                    <strong className="back-author-name">{testimonial.name}</strong>
                    <span className="back-author-role">{testimonial.role}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default TestimonialsSection;

const styles = `
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  .testimonials-showcase-section {
    width: 100%;
    padding: 100px 0;
    background: #ffffff;
    overflow: hidden;
    position: relative;
  }

  .testimonials-showcase-section::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: 
      radial-gradient(circle at 10% 20%, rgba(59, 130, 246, 0.03) 0%, transparent 50%),
      radial-gradient(circle at 90% 80%, rgba(168, 85, 247, 0.03) 0%, transparent 50%);
    pointer-events: none;
  }

  .testimonials-header {
    text-align: center;
    margin-bottom: 60px;
    padding: 0 20px;
    animation: fadeInUp 0.8s ease-out;
  }

  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .testimonials-main-title {
    font-size: 42px;
    font-weight: 700;
    color: #0f172a;
    margin-bottom: 16px;
    background: linear-gradient(135deg, #0f6eea 0%, #2563eb 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .testimonials-subtitle {
    font-size: 18px;
    color: #64748b;
    line-height: 1.6;
    max-width: 600px;
    margin: 0 auto;
  }

  .testimonials-scroll-wrapper {
    position: relative;
    width: 100%;
    overflow: hidden;
    padding: 20px 0;
  }

  .testimonials-scroll-wrapper::before,
  .testimonials-scroll-wrapper::after {
    content: '';
    position: absolute;
    top: 0;
    bottom: 0;
    width: 150px;
    z-index: 2;
    pointer-events: none;
  }

  .testimonials-scroll-wrapper::before {
    left: 0;
    background: linear-gradient(90deg, #ffffff 0%, transparent 100%);
  }

  .testimonials-scroll-wrapper::after {
    right: 0;
    background: linear-gradient(270deg, #ffffff 0%, transparent 100%);
  }

  .testimonials-scroll-track {
    display: flex;
    gap: 32px;
    animation: scrollTestimonials 40s linear infinite;
    padding: 0 20px;
  }

  @keyframes scrollTestimonials {
    0% {
      transform: translateX(0);
    }
    100% {
      transform: translateX(-33.33%);
    }
  }

  .testimonials-scroll-track:hover {
    animation-play-state: paused;
  }

  /* Flip Card Structure */
  .testimonial-flip-card {
    width: 350px;
    height: 320px;
    perspective: 1000px;
    flex-shrink: 0;
  }

  .testimonial-flip-inner {
    width: 100%;
    height: 100%;
    position: relative;
    transform-style: preserve-3d;
    transition: transform 0.8s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .testimonial-flip-card:hover .testimonial-flip-inner {
    transform: rotateY(180deg);
  }

  .testimonial-flip-front,
  .testimonial-flip-back {
    position: absolute;
    width: 100%;
    height: 100%;
    backface-visibility: hidden;
    border-radius: 20px;
    background: #ffffff;
    border: 2px solid #e2e8f0;
    display: flex;
    flex-direction: column;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
  }

  .testimonial-flip-front {
    transform: rotateY(0deg);
    padding: 32px 28px;
    justify-content: space-between;
  }

  .testimonial-flip-back {
    transform: rotateY(180deg);
    padding: 36px 28px;
    justify-content: center;
    position: relative;
    overflow: hidden;
  }

  /* Front Side Styles */
  .front-header {
    display: flex;
    align-items: center;
    gap: 16px;
    margin-bottom: 24px;
  }

  .front-avatar-wrapper {
    width: 70px;
    height: 70px;
    border-radius: 50%;
    overflow: hidden;
    border: 3px solid #e2e8f0;
    flex-shrink: 0;
  }

  .front-avatar-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .front-author-details {
    flex: 1;
  }

  .front-author-name {
    font-size: 18px;
    font-weight: 700;
    color: #0f172a;
    margin-bottom: 4px;
  }

  .front-author-role {
    font-size: 14px;
    color: #64748b;
    line-height: 1.4;
  }

  .front-rating-display {
    display: flex;
    gap: 6px;
    margin-bottom: 24px;
  }

  .rating-star {
    transition: transform 0.2s ease;
  }

  .testimonial-flip-card:hover .rating-star {
    transform: scale(1.1);
  }

  .front-hover-hint {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-top: 16px;
    border-top: 2px solid #f1f5f9;
  }

  .hint-text {
    font-size: 13px;
    color: #94a3b8;
    font-weight: 600;
  }

  .hint-arrow {
    font-size: 20px;
    color: #3b82f6;
    animation: arrowBounce 1.5s infinite;
  }

  @keyframes arrowBounce {
    0%, 100% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(4px);
    }
  }

  /* Back Side Styles */
  .back-quote-mark {
    position: absolute;
    top: 20px;
    left: 24px;
    font-size: 80px;
    color: #e2e8f0;
    font-family: Georgia, serif;
    line-height: 1;
  }

  .back-testimonial-text {
    font-size: 15px;
    color: #334155;
    line-height: 1.7;
    font-style: italic;
    margin-bottom: 24px;
    position: relative;
    z-index: 1;
  }

  .back-author-info {
    display: flex;
    flex-direction: column;
    gap: 6px;
    padding-top: 20px;
    border-top: 2px solid #f1f5f9;
  }

  .back-author-name {
    font-size: 16px;
    font-weight: 700;
    color: #0f172a;
  }

  .back-author-role {
    font-size: 14px;
    color: #64748b;
  }

  /* Responsive Design */
  @media (max-width: 768px) {
    .testimonials-showcase-section {
      padding: 60px 0;
    }

    .testimonials-main-title {
      font-size: 32px;
    }

    .testimonials-subtitle {
      font-size: 16px;
    }

    .testimonial-flip-card {
      width: 300px;
      height: 300px;
    }

    .testimonials-scroll-track {
      gap: 24px;
    }

    .front-avatar-wrapper {
      width: 60px;
      height: 60px;
    }

    .front-author-name {
      font-size: 16px;
    }

    .front-author-role {
      font-size: 13px;
    }

    .back-testimonial-text {
      font-size: 14px;
    }
  }
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
}