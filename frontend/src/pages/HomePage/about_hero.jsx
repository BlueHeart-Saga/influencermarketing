import React from 'react';
import { Heart, Users, Target, Award, Zap, TrendingUp } from 'lucide-react';
import AIMarketingShowcase from './AIMarketingShowcase';
import { useNavigate } from "react-router-dom";
import { Play } from "lucide-react";

const AboutUsHero = () => {

  const navigate = useNavigate();

  const goToLogin = () => {
    navigate("/login");
  };
  return (
    <div style={styles.container}>
      {/* Animated Background Elements */}
      <div style={styles.backgroundElements}>
        <div style={{...styles.blob, ...styles.blob1}}></div>
        <div style={{...styles.blob, ...styles.blob2}}></div>
        <div style={{...styles.blob, ...styles.blob3}}></div>
      </div>

      {/* Main Content */}
      <div style={styles.mainContent}>
        {/* Floating Icons */}
        {/* <div style={{...styles.floatingIcon, ...styles.icon1}}>
          <div style={styles.iconContainer1}>
            <Target style={styles.icon} />
          </div>
        </div>

        <div style={{...styles.floatingIcon, ...styles.icon2}}>
          <div style={styles.iconContainer2}>
            <Users style={styles.icon} />
          </div>
        </div>

        <div style={{...styles.floatingIcon, ...styles.icon3}}>
          <div style={styles.iconContainer3}>
            <Heart style={styles.icon} />
          </div>
        </div>

        <div style={{...styles.floatingIcon, ...styles.icon4}}>
          <div style={styles.iconContainer4}>
            <Award style={styles.icon} />
          </div>
        </div>

        <div style={{...styles.floatingIcon, ...styles.icon5}}>
          <div style={styles.iconContainer5}>
            <Zap style={styles.icon} />
          </div>
        </div>

        <div style={{...styles.floatingIcon, ...styles.icon6}}>
          <div style={styles.iconContainer6}>
            <TrendingUp style={styles.icon} />
          </div>
        </div> */}

        {/* Hero Text */}
        <div style={styles.heroText}>
          <h1 style={styles.title}>
            <span style={styles.titlePart1}>Empowering Brands with </span>
            <span style={styles.titleGradient}>Innovative Solutions</span>
          </h1>
          
          <p style={styles.description}>
            We're a team of passionate innovators dedicated to revolutionizing 
            influencer marketing through cutting-edge AI technology and 
            data-driven strategies.
          </p>

          {/* CTA Buttons */}
          <div style={styles.ctaContainer}>
            <button style={styles.primaryButton} onClick={goToLogin}>
              Get Started Free
            </button>
            <button onClick={() => navigate("/demo")} style={styles.secondaryButton}>
              <Play style={styles.buttonIcon} />
              View Demo
            </button>
          </div>
        </div>

        <div style={styles.heroImageWrapper}>
  <img
    src="/images/abouthero.png"
    alt="Brio Platform Dashboard"
    style={styles.heroImage}
  />
</div>


        {/* Team Members Section */}
        {/* <AIMarketingShowcase /> */}
      </div>
    </div>
  );
};

const styles = {
  container: {
    position: 'relative',
    minHeight: '95vh',
    background: 'linear-gradient(180deg, #F0F9FF 0%, #E0F2FE 50%, #BAE6FD 100%)',
    overflow: 'hidden',
  },
  
  backgroundElements: {
    position: 'absolute',
    inset: 0,
    overflow: 'hidden',
    pointerEvents: 'none',
  },
  
  blob: {
    position: 'absolute',
    borderRadius: '50%',
    mixBlendMode: 'multiply',
    filter: 'blur(20px)',
    animation: 'blob 7s infinite',
  },
  
  blob1: {
    top: '80px',
    left: '40px',
    width: '128px',
    height: '128px',
    background: '#bfdbfe',
    opacity: 0.7,
  },
  
  blob2: {
    top: '160px',
    right: '40px',
    width: '128px',
    height: '128px',
    background: '#e9d5ff',
    opacity: 0.7,
    animationDelay: '2s',
  },
  
  blob3: {
    bottom: '80px',
    left: '33%',
    width: '128px',
    height: '128px',
    background: '#fecaca',
    opacity: 0.7,
    animationDelay: '4s',
  },
  
  mainContent: {
  position: 'relative',
  maxWidth: '1200px',
  margin: '0 auto',
  padding: '64px 16px 0',
},
'@media (max-width: 768px)': {
  heroImageWrapper: {
    maxWidth: '100%',
    marginTop: '24px',
  },
},

  
  floatingIcon: {
    position: 'absolute',
    animation: 'float 3s ease-in-out infinite',
  },
  
  icon1: {
    top: '48px',
    left: '32px',
  },
  
  icon2: {
    top: '128px',
    right: '48px',
    animationDelay: '1s',
  },
  
  icon3: {
    top: '32px',
    right: '128px',
    animationDelay: '2s',
  },
  
  icon4: {
    bottom: '128px',
    left: '64px',
    animationDelay: '3s',
  },
  
  icon5: {
    top: '33%',
    left: '16px',
    animationDelay: '4s',
  },
  
  icon6: {
    top: '80px',
    right: '25%',
  },
  
  iconContainer1: {
    width: '64px',
    height: '64px',
    background: 'linear-gradient(135deg, #f97316 0%, #ec4899 100%)',
    borderRadius: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
    transition: 'transform 0.3s ease',
  },
  
  iconContainer2: {
    width: '64px',
    height: '64px',
    background: 'linear-gradient(135deg, #60a5fa 0%, #06b6d4 100%)',
    borderRadius: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
    transition: 'transform 0.3s ease',
  },
  
  iconContainer3: {
    width: '56px',
    height: '56px',
    background: 'linear-gradient(135deg, #f87171 0%, #ec4899 100%)',
    borderRadius: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
    transition: 'transform 0.3s ease',
  },
  
  iconContainer4: {
    width: '64px',
    height: '64px',
    background: 'linear-gradient(135deg, #a855f7 0%, #6366f1 100%)',
    borderRadius: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
    transition: 'transform 0.3s ease',
  },
  
  iconContainer5: {
    width: '48px',
    height: '48px',
    background: 'linear-gradient(135deg, #fbbf24 0%, #f97316 100%)',
    borderRadius: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
    transition: 'transform 0.3s ease',
  },
  
  iconContainer6: {
    width: '56px',
    height: '56px',
    background: 'linear-gradient(135deg, #4ade80 0%, #14b8a6 100%)',
    borderRadius: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
    transition: 'transform 0.3s ease',
  },
  
  icon: {
    width: '32px',
    height: '32px',
    color: '#ffffff',
  },
  
  heroText: {
    textAlign: 'center',
    marginBottom: '48px',
    animation: 'fadeIn 1s ease-out',
  },
  
  title: {
    fontSize: '48px',
    fontWeight: 700,
    marginBottom: '24px',
    lineHeight: 1.2,
  },
  
  titlePart1: {
    color: '#111827',
  },
  
  titleGradient: {
    color: '#2563eb',
  },
  
  description: {
    fontSize: '18px',
    color: '#4b5563',
    maxWidth: '768px',
    margin: '0 auto',
    lineHeight: 1.7,
  },
  
  ctaContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: '16px',
    marginTop: '32px',
  },
  
  primaryButton: {
    padding: '12px 32px',
    background: '#2563eb',
    color: '#ffffff',
    fontWeight: 600,
    borderRadius: '12px',
    border: 'none',
    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    fontSize: '16px',
  },
  
  secondaryButton: {
    padding: '12px 32px',
    background: '#ffffff',
    color: '#374151',
    fontWeight: 600,
    borderRadius: '12px',
    border: '2px solid #e5e7eb',
    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '16px',
  },
  
  buttonIcon: {
    width: '20px',
    height: '20px',
  },

  heroImageWrapper: {
  width: '100%',
  maxWidth: '1000px',
  margin: '0 auto',
  padding: '0 16px',
},

heroImage: {
  width: '100%',
  height: 'auto',
  display: 'block',
  objectFit: 'contain',
},

  
  teamSection: {
    position: 'relative',
    marginTop: '64px',
  },
  
  teamGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '16px',
    maxWidth: '1000px',
    margin: '0 auto',
  },
  
  teamMember: {
    position: 'relative',
    animation: 'slideUp 0.8s ease-out',
  },
  
  teamImageContainer: {
    position: 'relative',
    aspectRatio: '1 / 1',
    borderRadius: '16px',
    overflow: 'hidden',
    boxShadow: '0 20px 25px rgba(0, 0, 0, 0.1)',
    transition: 'all 0.3s ease',
  },
  
  teamImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  
  imageOverlay: {
    position: 'absolute',
    inset: 0,
    background: 'linear-gradient(to top, rgba(0, 0, 0, 0.5), transparent)',
    opacity: 0,
    transition: 'opacity 0.3s ease',
    display: 'flex',
    alignItems: 'flex-end',
    padding: '16px',
  },
  
  overlayText: {
    color: '#ffffff',
    fontWeight: 600,
  },
  
  // CSS animations
  '@keyframes blob': `
    0%, 100% { transform: translate(0, 0) scale(1); }
    33% { transform: translate(30px, -50px) scale(1.1); }
    66% { transform: translate(-20px, 20px) scale(0.9); }
  `,
  
  '@keyframes float': `
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-20px); }
  `,
  
  '@keyframes fadeIn': `
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  `,
  
  '@keyframes slideUp': `
    from { opacity: 0; transform: translateY(40px); }
    to { opacity: 1; transform: translateY(0); }
  `,
};

// Apply hover effects
Object.assign(styles.iconContainer1, {
  ':hover': { transform: 'scale(1.1)' }
});

Object.assign(styles.iconContainer2, {
  ':hover': { transform: 'scale(1.1)' }
});

Object.assign(styles.iconContainer3, {
  ':hover': { transform: 'scale(1.1)' }
});

Object.assign(styles.iconContainer4, {
  ':hover': { transform: 'scale(1.1)' }
});

Object.assign(styles.iconContainer5, {
  ':hover': { transform: 'scale(1.1)' }
});

Object.assign(styles.iconContainer6, {
  ':hover': { transform: 'scale(1.1)' }
});

Object.assign(styles.primaryButton, {
  ':hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 20px 25px rgba(0, 0, 0, 0.15)'
  }
});

Object.assign(styles.secondaryButton, {
  ':hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 20px 25px rgba(0, 0, 0, 0.15)',
    borderColor: '#93c5fd'
  }
});

Object.assign(styles.teamImageContainer, {
  ':hover': {
    transform: 'scale(1.05)'
  }
});

Object.assign(styles.imageOverlay, {
  ':hover': {
    opacity: 1
  }
});

// Responsive styles
const responsiveStyles = {
  '@media (max-width: 768px)': {
    title: {
      fontSize: '36px',
    },
    description: {
      fontSize: '16px',
      padding: '0 16px',
    },
    teamGrid: {
      gridTemplateColumns: '1fr',
      maxWidth: '400px',
    },
    ctaContainer: {
      flexDirection: 'column',
      alignItems: 'center',
    },
    primaryButton: {
      width: '100%',
      maxWidth: '300px',
    },
    secondaryButton: {
      width: '100%',
      maxWidth: '300px',
    },
  },
  '@media (max-width: 480px)': {
    title: {
      fontSize: '28px',
    },
    description: {
      fontSize: '14px',
    },
    floatingIcon: {
      display: 'none', // Hide floating icons on very small screens
    },
  },
};

// Combine all styles
const combinedStyles = {
  ...styles,
  ...responsiveStyles,
  // Convert keyframes to style tag content
  styleTag: `
    @keyframes blob {
      0%, 100% { transform: translate(0, 0) scale(1); }
      33% { transform: translate(30px, -50px) scale(1.1); }
      66% { transform: translate(-20px, 20px) scale(0.9); }
    }

    @keyframes float {
      0%, 100% { transform: translateY(0px); }
      50% { transform: translateY(-20px); }
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }

    @keyframes slideUp {
      from { opacity: 0; transform: translateY(40px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `
};

// Create a style tag for animations
const AboutUsHeroWithStyles = () => (
  <>
    <style>{combinedStyles.styleTag}</style>
    <AboutUsHero />
  </>
);

export default AboutUsHeroWithStyles;