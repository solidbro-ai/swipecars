import { PrismaClient, CarCondition } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

const sampleCars = [
  {
    make: 'Tesla',
    model: 'Model 3',
    year: 2023,
    price: 42990,
    mileage: 15000,
    location: 'San Francisco, CA',
    description: `Beautiful 2023 Tesla Model 3 Long Range in Pearl White. This car is in excellent condition with low mileage and has been meticulously maintained.

Features include:
- Autopilot
- Premium interior
- 18" Aero wheels
- Glass roof
- Premium audio

Clean title, single owner, no accidents. Range anxiety is a thing of the past with 358 miles of range!`,
    condition: 'EXCELLENT' as CarCondition,
    features: ['Autopilot', 'Premium Sound System', 'Leather Seats', 'Navigation System', 'Backup Camera', 'Electric'],
    images: [
      'https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=800',
      'https://images.unsplash.com/photo-1571127236794-81c0bbfe1ce3?w=800',
    ],
  },
  {
    make: 'BMW',
    model: '3 Series',
    year: 2022,
    price: 38500,
    mileage: 28000,
    location: 'Los Angeles, CA',
    description: `Stunning 2022 BMW 330i in Alpine White with M Sport Package. This sedan combines luxury, performance, and efficiency in one beautiful package.

Highlights:
- M Sport suspension
- 19" M wheels
- Vernasca leather
- Live Cockpit Professional
- Parking Assistant Plus

All services up to date at BMW dealership. Extended warranty available.`,
    condition: 'LIKE_NEW' as CarCondition,
    features: ['Leather Seats', 'Sunroof', 'Navigation System', 'Heated Seats', 'Apple CarPlay', 'Sport Mode'],
    images: [
      'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800',
      'https://images.unsplash.com/photo-1617531653332-bd46c24f2068?w=800',
    ],
  },
  {
    make: 'Toyota',
    model: 'RAV4',
    year: 2021,
    price: 32000,
    mileage: 35000,
    location: 'Seattle, WA',
    description: `Reliable 2021 Toyota RAV4 XLE Premium in Magnetic Gray Metallic. Perfect family SUV with excellent fuel economy and Toyota Safety Sense 2.0.

Includes:
- 8" touchscreen with Apple CarPlay
- SofTex seats
- Power liftgate
- Blind spot monitoring
- All-wheel drive

One owner, clean CARFAX, all maintenance records available.`,
    condition: 'EXCELLENT' as CarCondition,
    features: ['All-Wheel Drive', 'Backup Camera', 'Blind Spot Monitor', 'Apple CarPlay', 'Power Liftgate', 'Lane Departure Warning'],
    images: [
      'https://images.unsplash.com/photo-1581540222194-0def2dda95b8?w=800',
      'https://images.unsplash.com/photo-1609521263047-f8f205293f24?w=800',
    ],
  },
  {
    make: 'Ford',
    model: 'Mustang',
    year: 2020,
    price: 35000,
    mileage: 22000,
    location: 'Austin, TX',
    description: `Head-turning 2020 Ford Mustang GT in Race Red. This American muscle car packs a powerful 5.0L V8 engine producing 460 horsepower!

Features:
- 10-speed automatic
- MagneRide suspension
- Active valve exhaust
- SYNC 3 with 8" touchscreen
- Track apps

Always garaged, adult owned, never tracked. Sounds incredible!`,
    condition: 'EXCELLENT' as CarCondition,
    features: ['Leather Seats', 'Premium Sound System', 'Backup Camera', 'Sport Mode', 'Performance Package'],
    images: [
      'https://images.unsplash.com/photo-1584345604476-8ec5f82d66f4?w=800',
      'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800',
    ],
  },
  {
    make: 'Honda',
    model: 'Civic',
    year: 2023,
    price: 28500,
    mileage: 8000,
    location: 'Denver, CO',
    description: `Nearly new 2023 Honda Civic Sport Touring in Sonic Gray Pearl. The most refined Civic ever with a striking design and premium features.

Equipped with:
- 1.5L turbocharged engine
- Continuously variable transmission
- Honda Sensing suite
- Bose premium audio
- Wireless Apple CarPlay/Android Auto

Like new condition with factory warranty remaining!`,
    condition: 'LIKE_NEW' as CarCondition,
    features: ['Turbocharged', 'Honda Sensing', 'Wireless Charging', 'Apple CarPlay', 'Android Auto', 'Adaptive Cruise Control'],
    images: [
      'https://images.unsplash.com/photo-1606611013016-969c19ba27bb?w=800',
      'https://images.unsplash.com/photo-1619682817481-e994891cd1f5?w=800',
    ],
  },
  {
    make: 'Mercedes-Benz',
    model: 'C-Class',
    year: 2022,
    price: 45000,
    mileage: 18000,
    location: 'Miami, FL',
    description: `Elegant 2022 Mercedes-Benz C300 4MATIC in Polar White. This luxury sedan offers an unparalleled driving experience with cutting-edge technology.

Premium features:
- AMG Line exterior
- MBUX infotainment
- Burmester sound system
- 64-color ambient lighting
- Digital instrument cluster

Certified Pre-Owned with unlimited mileage warranty!`,
    condition: 'EXCELLENT' as CarCondition,
    features: ['All-Wheel Drive', 'Leather Seats', 'Heated Seats', 'Premium Sound System', 'Navigation System', 'Sunroof'],
    images: [
      'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800',
      'https://images.unsplash.com/photo-1609521263047-f8f205293f24?w=800',
    ],
  },
  {
    make: 'Jeep',
    model: 'Wrangler',
    year: 2021,
    price: 42000,
    mileage: 25000,
    location: 'Phoenix, AZ',
    description: `Adventure-ready 2021 Jeep Wrangler Unlimited Rubicon in Sarge Green. The ultimate off-road machine with modern comfort.

Trail-rated features:
- 3.6L Pentastar V6
- 8-speed automatic
- Dana 44 axles
- Electronic disconnecting sway bar
- 33" mud terrain tires

Lightly used on trails, mostly highway driven. Ready for your next adventure!`,
    condition: 'GOOD' as CarCondition,
    features: ['Four-Wheel Drive', 'Navigation System', 'Heated Seats', 'Alpine Sound System', 'Remote Start'],
    images: [
      'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=800',
      'https://images.unsplash.com/photo-1506015391gy-a20b66e8e48b?w=800',
    ],
  },
  {
    make: 'Audi',
    model: 'Q5',
    year: 2022,
    price: 48000,
    mileage: 12000,
    location: 'Chicago, IL',
    description: `Sophisticated 2022 Audi Q5 Premium Plus in Navarra Blue Metallic. This compact luxury SUV delivers comfort and performance in equal measure.

Key features:
- Quattro all-wheel drive
- Virtual cockpit plus
- Bang & Olufsen 3D sound
- Panoramic sunroof
- Matrix LED headlights

Audi Care prepaid maintenance included through 2025!`,
    condition: 'LIKE_NEW' as CarCondition,
    features: ['All-Wheel Drive', 'Panoramic Sunroof', 'Premium Sound System', 'Heated Seats', 'Apple CarPlay', 'Adaptive Cruise Control'],
    images: [
      'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800',
      'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?w=800',
    ],
  },
  {
    make: 'Porsche',
    model: '911',
    year: 2021,
    price: 125000,
    mileage: 8500,
    location: 'New York, NY',
    description: `Iconic 2021 Porsche 911 Carrera S in GT Silver Metallic. The definitive sports car that needs no introduction.

Specifications:
- 3.0L twin-turbo flat-six
- 443 horsepower
- PDK dual-clutch transmission
- Sport Chrono Package
- PASM adaptive suspension

Pampered by enthusiast owner, always garaged, all service records.`,
    condition: 'EXCELLENT' as CarCondition,
    features: ['Sport Mode', 'Premium Sound System', 'Navigation System', 'Leather Seats', 'Adaptive Cruise Control'],
    images: [
      'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?w=800',
      'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800',
    ],
  },
  {
    make: 'Chevrolet',
    model: 'Silverado',
    year: 2022,
    price: 52000,
    mileage: 20000,
    location: 'Dallas, TX',
    description: `Workhorse 2022 Chevrolet Silverado 1500 LT Trail Boss in Black. Built for both work and play with serious off-road capability.

Features include:
- 5.3L V8 EcoTec3
- Z71 Off-Road Package
- 2-inch factory lift
- Rancho shocks
- Bed liner and tonneau cover

Towing package, never used for heavy hauling. Ready to work!`,
    condition: 'EXCELLENT' as CarCondition,
    features: ['Four-Wheel Drive', 'Tow Package', 'Backup Camera', 'Apple CarPlay', 'Heated Seats', 'Roof Rack'],
    images: [
      'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800',
      'https://images.unsplash.com/photo-1590362891991-f776e747a588?w=800',
    ],
  },
]

async function main() {
  console.log('🌱 Starting seed...')

  // Create demo users
  const hashedPassword = await hash('Demo123!', 12)

  const demoUser = await prisma.user.upsert({
    where: { email: 'demo@swipecars.com' },
    update: {},
    create: {
      name: 'Demo User',
      email: 'demo@swipecars.com',
      password: hashedPassword,
      location: 'San Francisco, CA',
      bio: 'Car enthusiast and SwipeCars demo user. Love helping people find their dream cars!',
      publicKey: 'demoPublicKey123',
      privateKeyEnc: 'demoPrivateKey123',
    },
  })

  const seller1 = await prisma.user.upsert({
    where: { email: 'seller1@swipecars.com' },
    update: {},
    create: {
      name: 'John Smith',
      email: 'seller1@swipecars.com',
      password: hashedPassword,
      location: 'Los Angeles, CA',
      bio: 'Trusted car seller with 10+ years of experience.',
      publicKey: 'seller1PublicKey',
      privateKeyEnc: 'seller1PrivateKey',
    },
  })

  const seller2 = await prisma.user.upsert({
    where: { email: 'seller2@swipecars.com' },
    update: {},
    create: {
      name: 'Sarah Johnson',
      email: 'seller2@swipecars.com',
      password: hashedPassword,
      location: 'Seattle, WA',
      bio: 'Car collector looking to share my passion with others.',
      publicKey: 'seller2PublicKey',
      privateKeyEnc: 'seller2PrivateKey',
    },
  })

  console.log('✅ Created demo users')

  // Create demo cars
  const sellers = [demoUser, seller1, seller2]

  for (let i = 0; i < sampleCars.length; i++) {
    const carData = sampleCars[i]
    const seller = sellers[i % sellers.length]

    const existingCar = await prisma.car.findFirst({
      where: {
        make: carData.make,
        model: carData.model,
        year: carData.year,
        userId: seller.id,
      },
    })

    if (!existingCar) {
      await prisma.car.create({
        data: {
          userId: seller.id,
          make: carData.make,
          model: carData.model,
          year: carData.year,
          price: carData.price,
          mileage: carData.mileage,
          location: carData.location,
          description: carData.description,
          condition: carData.condition,
          features: carData.features,
          images: {
            create: carData.images.map((url, index) => ({
              url,
              order: index,
            })),
          },
          priceHistory: {
            create: {
              price: carData.price,
            },
          },
        },
      })
      console.log(`✅ Created: ${carData.year} ${carData.make} ${carData.model}`)
    } else {
      console.log(`⏭️ Skipped (exists): ${carData.year} ${carData.make} ${carData.model}`)
    }
  }

  console.log('')
  console.log('🎉 Seed completed!')
  console.log('')
  console.log('Demo accounts:')
  console.log('  Email: demo@swipecars.com')
  console.log('  Password: Demo123!')
  console.log('')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
