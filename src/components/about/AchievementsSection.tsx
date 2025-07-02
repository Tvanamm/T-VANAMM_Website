
import React from 'react';
import CountingNumber from '@/components/CountingNumber';

const AchievementsSection = () => {
  const achievements = [
    { number: 150, suffix: "+", label: "Premium Products" },
    { number: 50, suffix: "+", label: "Locations" },
    { number: 100, suffix: "K+", label: "Cups Daily" },
    { number: 4.9, suffix: "/5", label: "Rating" }
  ];

  return (
    <section className="py-12 px-4 bg-emerald-600">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {achievements.map((achievement, index) => (
            <div key={index} className="text-center text-white">
              <div className="text-3xl md:text-4xl font-bold mb-2">
                <CountingNumber target={achievement.number} suffix={achievement.suffix} />
              </div>
              <div className="text-emerald-100 font-medium">{achievement.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AchievementsSection;
