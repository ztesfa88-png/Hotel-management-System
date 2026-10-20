import { PrismaClient, UserRole, RoomStatus } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting Woliso Hotel database seed...');

  const adminPassword = await bcrypt.hash('Admin@123', 12);
  await prisma.user.upsert({
    where: { email: 'admin@wolisohotel.com' },
    update: {},
    create: {
      email: 'admin@wolisohotel.com',
      password: adminPassword,
      firstName: 'Woliso',
      lastName: 'Administrator',
      role: UserRole.ADMIN,
      isActive: true,
      isVerified: true,
    },
  });

  const staffPassword = await bcrypt.hash('Staff@123', 12);
  await prisma.user.upsert({
    where: { email: 'staff@wolisohotel.com' },
    update: {},
    create: {
      email: 'staff@wolisohotel.com',
      password: staffPassword,
      firstName: 'Hotel',
      lastName: 'Staff',
      role: UserRole.STAFF,
      isActive: true,
      isVerified: true,
    },
  });

  const guestPassword = await bcrypt.hash('Guest@123', 12);
  await prisma.user.upsert({
    where: { email: 'guest@wolisohotel.com' },
    update: {},
    create: {
      email: 'guest@wolisohotel.com',
      password: guestPassword,
      firstName: 'Demo',
      lastName: 'Guest',
      role: UserRole.GUEST,
      isActive: true,
      isVerified: true,
    },
  });

  const branches = await Promise.all([
    prisma.branch.upsert({
      where: { name: 'Woliso Hotel - Branch No. 1' },
      update: { city: 'Woliso', region: 'Oromia', country: 'Ethiopia' },
      create: {
        name: 'Woliso Hotel - Branch No. 1',
        city: 'Woliso',
        region: 'Oromia',
        country: 'Ethiopia',
      },
    }),
    prisma.branch.upsert({
      where: { name: 'Woliso Hotel - Branch No. 2' },
      update: { city: 'Woliso', region: 'Oromia', country: 'Ethiopia' },
      create: {
        name: 'Woliso Hotel - Branch No. 2',
        city: 'Woliso',
        region: 'Oromia',
        country: 'Ethiopia',
      },
    }),
  ]);

  const roomTypes = await Promise.all([
    prisma.roomType.upsert({
      where: { name: 'Standard Single' },
      update: { basePrice: 899.99 },
      create: {
        name: 'Standard Single',
        description: 'A comfortable single room for a relaxing stay in Woliso.',
        basePrice: 899.99,
        maxGuests: 1,
        amenities: ['WiFi', 'TV', 'Private Bathroom'],
      },
    }),
    prisma.roomType.upsert({
      where: { name: 'Standard Double' },
      update: { basePrice: 1299.99 },
      create: {
        name: 'Standard Double',
        description: 'A spacious double room with the essentials for your stay.',
        basePrice: 1299.99,
        maxGuests: 2,
        amenities: ['WiFi', 'TV', 'Private Bathroom', 'Work Desk'],
      },
    }),
    prisma.roomType.upsert({
      where: { name: 'Deluxe Suite' },
      update: { basePrice: 2499.99 },
      create: {
        name: 'Deluxe Suite',
        description: 'A generously sized suite with a separate sitting area.',
        basePrice: 2499.99,
        maxGuests: 3,
        amenities: ['WiFi', 'Smart TV', 'Private Bathroom', 'Work Desk', 'Sitting Area'],
      },
    }),
    prisma.roomType.upsert({
      where: { name: 'Presidential Suite' },
      update: { basePrice: 4999.99 },
      create: {
        name: 'Presidential Suite',
        description: 'A spacious suite for guests seeking extra room and comfort.',
        basePrice: 4999.99,
        maxGuests: 4,
        amenities: ['WiFi', 'Smart TV', 'Private Bathroom', 'Kitchen', 'Dining Area', 'Living Room'],
      },
    }),
    prisma.roomType.upsert({
      where: { name: 'Family Room' },
      update: { basePrice: 1799.99 },
      create: {
        name: 'Family Room',
        description: 'A roomy option for families travelling together.',
        basePrice: 1799.99,
        maxGuests: 4,
        amenities: ['WiFi', 'TV', 'Private Bathroom', 'Mini Fridge'],
      },
    }),
  ]);

  const roomsData = [
    { roomNumber: '101', floor: 1, roomTypeId: roomTypes[0].id },
    { roomNumber: '102', floor: 1, roomTypeId: roomTypes[0].id },
    { roomNumber: '103', floor: 1, roomTypeId: roomTypes[0].id },
    { roomNumber: '104', floor: 1, roomTypeId: roomTypes[1].id },
    { roomNumber: '105', floor: 1, roomTypeId: roomTypes[1].id },
    { roomNumber: '201', floor: 2, roomTypeId: roomTypes[1].id },
    { roomNumber: '202', floor: 2, roomTypeId: roomTypes[1].id },
    { roomNumber: '203', floor: 2, roomTypeId: roomTypes[1].id },
    { roomNumber: '204', floor: 2, roomTypeId: roomTypes[4].id },
    { roomNumber: '205', floor: 2, roomTypeId: roomTypes[4].id },
    { roomNumber: '301', floor: 3, roomTypeId: roomTypes[2].id },
    { roomNumber: '302', floor: 3, roomTypeId: roomTypes[2].id },
    { roomNumber: '303', floor: 3, roomTypeId: roomTypes[2].id },
    { roomNumber: '401', floor: 4, roomTypeId: roomTypes[3].id },
    { roomNumber: '402', floor: 4, roomTypeId: roomTypes[3].id },
  ];

  for (const branch of branches) {
    for (const roomData of roomsData) {
      await prisma.room.upsert({
        where: {
          branchId_roomNumber: {
            branchId: branch.id,
            roomNumber: roomData.roomNumber,
          },
        },
        update: {
          floor: roomData.floor,
          roomTypeId: roomData.roomTypeId,
        },
        create: {
          ...roomData,
          branchId: branch.id,
          status: RoomStatus.AVAILABLE,
          description: `${branch.name}, room ${roomData.roomNumber}`,
          images: [],
        },
      });
    }
  }

  console.log(`Created or updated ${branches.length} Woliso Hotel branches.`);
  console.log(`Created or updated ${roomsData.length * branches.length} rooms.`);
  console.log('Database seeded successfully.');
  console.log('\nDemo login credentials:');
  console.log('  Admin: admin@wolisohotel.com / Admin@123');
  console.log('  Staff: staff@wolisohotel.com / Staff@123');
  console.log('  Guest: guest@wolisohotel.com / Guest@123');
}

main()
  .catch((error) => {
    console.error('Woliso Hotel database seed failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
