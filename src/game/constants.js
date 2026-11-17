export const LANE_WIDTH = 2.6;
export const LANES = [-LANE_WIDTH, 0, LANE_WIDTH];
export const CORRIDOR_WIDTH = 9.2;

export const DIFFICULTIES = {
  chill: {
    id: 'chill',
    label: 'Chill Break',
    subtitle: 'Nhẹ nhàng giờ nghỉ trưa',
    baseSpeed: 12,
    maxSpeed: 24,
    speedRamp: 0.18,
    spawnInterval: 1.15,
    minSpawnInterval: 0.58,
    startSanity: 4
  },
  crunch: {
    id: 'crunch',
    label: 'Crunch Time',
    subtitle: 'Chạy deadline tiêu chuẩn',
    baseSpeed: 15,
    maxSpeed: 31,
    speedRamp: 0.28,
    spawnInterval: 0.95,
    minSpawnInterval: 0.45,
    startSanity: 3
  },
  friday: {
    id: 'friday',
    label: 'Friday 5 PM',
    subtitle: 'Chạy trốn sếp về đúng giờ',
    baseSpeed: 19,
    maxSpeed: 38,
    speedRamp: 0.36,
    spawnInterval: 0.78,
    minSpawnInterval: 0.36,
    startSanity: 3
  }
};

export const OFFICE_RANKS = [
  { minScore: 0, title: 'Thực tập sinh lạc lối', badge: '🪪' },
  { minScore: 400, title: 'Junior né việc', badge: '💻' },
  { minScore: 1000, title: 'Senior lướt ghế', badge: '🪑' },
  { minScore: 2000, title: 'Tech Lead miễn nhiễm họp', badge: '☕' },
  { minScore: 3500, title: 'Principal Coffee Architect', badge: '⚡' },
  { minScore: 5500, title: 'VP Về Đúng 5h00 Chiều', badge: '🏆' }
];

export const COLORS = {
  floorMain: 0x3b4252,
  floorLane: 0x434c5e,
  floorStripe: 0x4c566a,
  wall: 0xd8dee9,
  cubicle: 0x5e81ac,
  desk: 0xd08770,
  chairFabric: 0x2e3440,
  chairAccent: 0x88c0d0,
  coffee: 0x6f4e37,
  coffeeCup: 0xeceff4,
  managerSuit: 0xbf616a,
  printer: 0xe5e9f0,
  warning: 0xebcb8b,
  donut: 0xb48ead,
  approval: 0xa3be8c
};

export const STORAGE_KEY = 'office_rush_3d_stats_v1';
