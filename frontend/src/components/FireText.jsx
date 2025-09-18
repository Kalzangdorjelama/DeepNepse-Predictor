import { useSpring, animated } from "@react-spring/web";

export default function FireText({ children }) {
  const fireAnimation = useSpring({
    from: { opacity: 0.6, transform: "scale(1)" },
    to: async (next) => {
      while (1) {
        await next({ opacity: 1, transform: "scale(1.05)" });
        await next({ opacity: 0.6, transform: "scale(1)" });
      }
    },
    config: { tension: 180, friction: 12 },
    loop: true,
  });

  return (
    <animated.h1
      style={fireAnimation}
      className="text-2xl sm:text-3xl font-bold text-orange-500 relative inline-block"
    >
      {children}
    </animated.h1>
  );
}
