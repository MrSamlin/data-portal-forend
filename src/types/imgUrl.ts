  const imgFiles = [
    '0c6a4422-6d7f-460d-8a48-d437113a4c1d.jpg',
    '5faaed22-2153-4354-af64-2b50d35b47be.jpg',
    '3882ea6c-23c9-4162-933e-1e9680abdd04.png',
    '3bf37fd8-b34e-4da6-8667-63a34415a6a5.png',
    '68d64a71-56b5-4760-a73a-d290b549218f.png',
    'a60a43e7-ea81-444c-85e1-1f1240964e7d.png',
    '4350d762-330f-4546-b095-0c2421e0c7e9.png',
    'a6627422-dd3f-40d1-a321-1d81c018c752.webp',
  ];


  const iconFiles = [
    'bigView.png',
    'bigView2.png',
    'car.png',
    'car2.png',
    'land.png',
    'land2.png',
    'skill.png',
    'skill2.png',
    'tech.png',
    'tech2.png',
  ];

export const imgList = imgFiles.map(file => ({ value: file, label: file }));
export const iconList = iconFiles.map(file => ({ value: file, label: file }));