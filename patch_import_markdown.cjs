const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

content = content.replace(
  'import { motion } from "motion/react";',
  'import { motion } from "motion/react";\nimport Markdown from "react-markdown";'
);

fs.writeFileSync('src/App.tsx', content);
