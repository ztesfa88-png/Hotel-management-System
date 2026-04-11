import { PrismaClient, UserRole, RoomStatus } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create admin user
  const adminPassword = await bcrypt.hash('Admin@123', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@hotel.com' },
    update: {},
    create: {
      email: 'admin@hotel.com',
      password: adminPassword,
      firstName: 'System',
      lastName: 'Admin',
      role: UserRole.ADMIN,
      isActive: true,
      isVerified: true,
    },
  });
  console.log('✅ Admin user created:', admin.email);

  // Create staff user
  const staffPassword = await bcrypt.hash('Staff@123', 12);
  const staff = await prisma.user.upsert({
    where: { email: 'staff@hotel.com' },
    update: {},
    create: {
      email: 'staff@hotel.com',
      password: staffPassword,
      firstName: 'Front',
      lastName: 'Desk',
      phone: '+1234567890',
      role: UserRole.STAFF,
      isActive: true,
      isVerified: true,
    },
  });
  console.log('✅ Staff user created:', staff.email);

  // Create guest user
  const guestPassword = await bcrypt.hash('Guest@123', 12);
  const guest = await prisma.user.upsert({
    where: { email: 'guest@hotel.com' },
    update: {},
    create: {
      email: 'guest@hotel.com',
      password: guestPassword,
      firstName: 'John',
      lastName: 'Doe',
      phone: '+0987654321',
      role: UserRole.GUEST,
      isActive: true,
      isVerified: true,
    },
  });
  console.log('✅ Guest user created:', guest.email);

  // Create room types
  const roomTypes = await Promise.all([
    prisma.roomType.upsert({
      where: { name: 'Standard Single' },
      update: { basePrice: 899.99 },
      create: {
        name: 'Standard Single',
        description: 'Comfortable single room with all basic amenities',
        basePrice: 899.99,
        maxGuests: 1,
        amenities: ['WiFi', 'TV', 'Air Conditioning', 'Private Bathroom', 'Mini Fridge'],
      },
    }),
    prisma.roomType.upsert({
      where: { name: 'Standard Double' },
      update: { basePrice: 1299.99 },
      create: {
        name: 'Standard Double',
        description: 'Spacious double room perfect for couples',
        basePrice: 1299.99,
        maxGuests: 2,
        amenities: ['WiFi', 'TV', 'Air Conditioning', 'Private Bathroom', 'Mini Fridge', 'Work Desk'],
      },
    }),
    prisma.roomType.upsert({
      where: { name: 'Deluxe Suite' },
      update: { basePrice: 2499.99 },
      create: {
        name: 'Deluxe Suite',
        description: 'Luxurious suite with separate living area and premium amenities',
        basePrice: 2499.99,
        maxGuests: 3,
        amenities: ['WiFi', 'Smart TV', 'Air Conditioning', 'Jacuzzi', 'Mini Bar', 'Work Desk', 'Lounge Area', 'Room Service'],
      },
    }),
    prisma.roomType.upsert({
      where: { name: 'Presidential Suite' },
      update: { basePrice: 4999.99 },
      create: {
        name: 'Presidential Suite',
        description: 'The ultimate luxury experience with panoramic views',
        basePrice: 4999.99,
        maxGuests: 4,
        amenities: ['WiFi', 'Smart TV', 'Air Conditioning', 'Jacuzzi', 'Full Bar', 'Kitchen', 'Dining Area', 'Living Room', 'Butler Service', 'Room Service', 'Balcony'],
      },
    }),
    prisma.roomType.upsert({
      where: { name: 'Family Room' },
      update: { basePrice: 1799.99 },
      create: {
        name: 'Family Room',
        description: 'Spacious room designed for families with children',
        basePrice: 1799.99,
        maxGuests: 4,
        amenities: ['WiFi', 'TV', 'Air Conditioning', 'Private Bathroom', 'Mini Fridge', 'Bunk Beds', 'Kids Corner'],
      },
    }),
  ]);
  console.log('✅ Room types created:', roomTypes.length);

  // Create rooms
  const roomsData = [
    // Floor 1 - Standard Single
    { roomNumber: '101', floor: 1, roomTypeId: roomTypes[0].id },
    { roomNumber: '102', floor: 1, roomTypeId: roomTypes[0].id },
    { roomNumber: '103', floor: 1, roomTypeId: roomTypes[0].id },
    // Floor 1 - Standard Double
    { roomNumber: '104', floor: 1, roomTypeId: roomTypes[1].id },
    { roomNumber: '105', floor: 1, roomTypeId: roomTypes[1].id },
    // Floor 2 - Standard Double
    { roomNumber: '201', floor: 2, roomTypeId: roomTypes[1].id },
    { roomNumber: '202', floor: 2, roomTypeId: roomTypes[1].id },
    { roomNumber: '203', floor: 2, roomTypeId: roomTypes[1].id },
    // Floor 2 - Family Room
    { roomNumber: '204', floor: 2, roomTypeId: roomTypes[4].id },
    { roomNumber: '205', floor: 2, roomTypeId: roomTypes[4].id },
    // Floor 3 - Deluxe Suite
    { roomNumber: '301', floor: 3, roomTypeId: roomTypes[2].id },
    { roomNumber: '302', floor: 3, roomTypeId: roomTypes[2].id },
    { roomNumber: '303', floor: 3, roomTypeId: roomTypes[2].id },
    // Floor 4 - Presidential Suite
    { roomNumber: '401', floor: 4, roomTypeId: roomTypes[3].id },
    { roomNumber: '402', floor: 4, roomTypeId: roomTypes[3].id },
  ];

  for (const roomData of roomsData) {
    await prisma.room.upsert({
      where: { roomNumber: roomData.roomNumber },
      update: {},
      create: {
        ...roomData,
        status: RoomStatus.AVAILABLE,
        description: `Room ${roomData.roomNumber} on floor ${roomData.floor}`,
        images: [],
      },
    });
  }
  console.log('✅ Rooms created:', roomsData.length);

  console.log('🎉 Database seeded successfully!');
  console.log('\n📋 Login Credentials:');
  console.log('  Admin:  admin@hotel.com / Admin@123');
  console.log('  Staff:  staff@hotel.com / Staff@123');
  console.log('  Guest:  guest@hotel.com / Guest@123');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
