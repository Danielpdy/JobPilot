'use client';
import AnimatedContent from '../AnimatedContent/AnimatedContent';

const AnimatedContentLeft = ({ children, distance = 80, duration = 0.8, delay = 0, className = '', ...props }) => (
  <AnimatedContent
    distance={distance}
    direction="horizontal"
    reverse
    duration={duration}
    ease="power3.out"
    initialOpacity={0}
    animateOpacity
    threshold={0.1}
    delay={delay}
    className={className}
    {...props}
  >
    {children}
  </AnimatedContent>
);

export default AnimatedContentLeft;
