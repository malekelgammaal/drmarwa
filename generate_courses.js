const fs = require('fs');

const template = fs.readFileSync('course-content.html', 'utf8');

const courses = [
  { id: 'healing-journey-program', title: 'Healing Journey Program', badge: 'Featured' },
  { id: 'cbt-course', title: 'CBT Course', badge: 'Therapy' },
  { id: 'dbt-course', title: 'DBT Course', badge: 'Therapy' },
  { id: 'personality-disorders-course', title: 'Personality Disorders Course', badge: 'Guide' },
  { id: 'act-course', title: 'ACT Course', badge: 'Therapy' }
];

courses.forEach(c => {
  let content = template.replace(
      '<span class="course-badge" style="background: rgba(20,184,166,0.1); color: var(--primary); padding: 0.2rem 0.5rem; border-radius: 4px; font-size: 0.8rem; font-weight: 600;">Healing Journey Program</span>', 
      `<span class="course-badge" style="background: rgba(20,184,166,0.1); color: var(--primary); padding: 0.2rem 0.5rem; border-radius: 4px; font-size: 0.8rem; font-weight: 600;">${c.title}</span>`
  );
  content = content.replace(/<title>Course Content \| Dr\. Marwa Badr<\/title>/, `<title>${c.title} | Dr. Marwa Badr</title>`);
  fs.writeFileSync('course-' + c.id + '.html', content);
  console.log('Created course-' + c.id + '.html');
});
