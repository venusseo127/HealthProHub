# Healthcare Management Platform

A comprehensive healthcare management system designed for hospitals, clinics, doctors, nurses, and affiliates. This platform provides complete patient management, OPD/IPD admissions, billing, inventory tracking, and reporting capabilities.

## 🌟 Features

### Patient Management
- **Patient Registration**: Complete patient demographics with medical history
- **Medical Records**: Blood group, allergies, medical history tracking
- **Patient Search**: Advanced search and filtering capabilities
- **Patient Dashboard**: Quick access to patient information

### OPD/IPD Management
- **Admission Form**: Patient admission Details
- **Admission Records**: Room or Ward, Doctors, Date admitted
- **Patient Search**: Advanced search and filtering capabilities, active and discharge

### Billing System
- **Invoice Management**: Generate and track medical bills
- **Payment Processing**: Multiple payment methods support
- **Billing History**: Complete transaction records
- **Outstanding Payments**: Track pending and overdue payments

### Inventory Management
- **Medical Supplies**: Track medicines, equipment, and supplies
- **Stock Monitoring**: Low stock alerts and reorder management
- **Supplier Management**: Maintain supplier relationships
- **Cost Tracking**: Monitor inventory costs and usage

### Treatment Logs
- **Case Sheets**: Detailed treatment records
- **Diagnosis Tracking**: Medical diagnosis and treatment plans
- **Progress Notes**: Monitor patient progress
- **Prescription Management**: Track medications and dosages

### Role-Based Access Control
- **Doctor**: Full access to their patients and treatments
- **Nurse**: Hospital-level access, patient management
- **Clinic Staff**: Patient registration, billing, OPD/IPD management
- **Affiliate**: Account creation and commission tracking
- **Admin**: System-wide administration and reporting

## 🛠️ Technology Stack

### Frontend
- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **shadcn/ui** component library
- **Wouter** for routing
- **TanStack Query** for data fetching
- **React Hook Form** with Zod validation
- **Zustand** for state management

### Backend
- **Node.js** with Express.js
- **TypeScript** with ESM modules
- **PostgreSQL** database
- **Drizzle ORM** for database operations
- **Neon Database** (serverless PostgreSQL)

### Authentication
- **Firebase Authentication** (configured)
- **Session Management** with PostgreSQL store
- **JWT/OAuth2** ready architecture

## 📋 Prerequisites

Before installing, ensure you have:

- **Node.js** (v18 or higher)
- **npm** or **yarn** package manager
- **PostgreSQL** database (or Neon account)
- **Firebase project** (for authentication)

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd brainbooster
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Setup

Create a `.env` file in the root directory with the following variables:

```env
# Database Configuration
DATABASE_URL=postgresql://username:password@host:port/database
PGHOST=your-postgres-host
PGPORT=5432
PGUSER=your-username
PGPASSWORD=your-password
PGDATABASE=your-database-name
neon serverless - foto overview and enable api

# Firebase Configuration
VITE_FIREBASE_API_KEY=your-firebase-api-key
VITE_FIREBASE_PROJECT_ID=your-firebase-project-id
VITE_FIREBASE_APP_ID=your-firebase-app-id

# Development
NODE_ENV=development
```

### 4. Database Setup

Initialize the database schema:

```bash
npm run db:push
```

This command will:
- Create all necessary tables
- Set up relationships and constraints
- Initialize the database structure

### 5. Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new Firebase project
3. Enable Authentication and select Google sign-in method
4. Add your domain to authorized domains
5. Copy the configuration values to your `.env` file

### 6. Start the Application

```bash
npm run dev
```

The application will be available at `http://localhost:5000`

## 📊 Database Schema

### Core Tables

#### Users
- Multi-role user management (doctor, nurse, clinic_staff, affiliate, admin)
- User authentication and profile information
- Role-based permissions and access control

#### Patients
- Complete patient demographics
- Medical history and allergies
- Contact information and emergency contacts
- Blood group and medical conditions

#### Admissions
- OPD/IPD admission tracking
- Priority levels (normal, urgent, critical)
- Admission types and status tracking
- Doctor assignments and bed allocations

#### Billing
- Invoice generation and management
- Payment tracking and methods
- Outstanding balance calculations
- Billing history and reports

#### Inventory
- Medical supplies and equipment tracking
- Stock levels and reorder points
- Supplier information and costs
- Usage tracking and analytics

#### Treatment Logs
- Medical case sheets and diagnosis
- Treatment plans and prescriptions
- Progress notes and observations
- Medical history documentation

#### Diet Plans
- Patient nutrition management
- Dietary restrictions and preferences
- Meal planning and tracking
- Nutritional analysis

## 🔧 Development

### Project Structure

```
healthcare-management-platform/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Application pages
│   │   ├── hooks/          # Custom React hooks
│   │   ├── lib/            # Utility functions
│   │   ├── store/          # State management
│   │   └── types/          # TypeScript types
├── server/                 # Backend Express application
│   ├── routes.ts           # API route definitions
│   ├── storage.ts          # Database operations
│   ├── db.ts              # Database connection
│   └── utils/             # Server utilities
├── shared/                 # Shared code between client/server
│   └── schema.ts          # Database schema definitions
└── docs/                  # Documentation files
```

### Available Scripts

```bash
# Development
npm run dev              # Start development server
npm run build           # Build for production
npm run preview         # Preview production build

# Database
npm run db:push         # Push schema changes to database
npm run db:generate     # Generate migration files
npm run db:migrate      # Run database migrations

# Code Quality
npm run lint            # Run ESLint
npm run type-check      # Run TypeScript checks
```

### API Endpoints

#### Patients
- `GET /api/patients` - Get all patients
- `POST /api/patients` - Create new patient
- `GET /api/patients/:id` - Get patient by ID
- `PUT /api/patients/:id` - Update patient
- `GET /api/patients/search` - Search patients

#### Billing
- `GET /api/billing` - Get all billing records
- `POST /api/billing` - Create new bill
- `GET /api/billing/:id` - Get bill by ID
- `PUT /api/billing/:id` - Update bill
- `GET /api/billing/patient/:id` - Get patient billing history

#### Appointments
- `GET /api/appointments` - Get all appointments
- `POST /api/appointments` - Create new appointment
- `GET /api/appointments/today` - Get today's appointments
- `GET /api/appointments/doctor/:id` - Get doctor's appointments

#### Inventory
- `GET /api/inventory` - Get all inventory items
- `POST /api/inventory` - Create new inventory item
- `GET /api/inventory/low-stock` - Get low stock items
- `PUT /api/inventory/:id` - Update inventory item

## 🔐 Security

### Authentication
- Firebase Authentication integration
- Session-based authentication with PostgreSQL storage
- JWT token validation
- Role-based access control

### Data Protection
- SQL injection prevention with Drizzle ORM
- Input validation with Zod schemas
- CORS configuration for API security
- Environment variable protection

### Privacy Compliance
- HIPAA-compliant data handling
- Patient data encryption
- Audit logging for sensitive operations
- Secure data transmission

## 🚀 Deployment

### Production Build

```bash
npm run build
```

### Environment Variables

Set the following environment variables in production:

```env
NODE_ENV=production
DATABASE_URL=your-production-database-url
VITE_FIREBASE_API_KEY=your-production-firebase-key
VITE_FIREBASE_PROJECT_ID=your-production-project-id
VITE_FIREBASE_APP_ID=your-production-app-id
```

### Deployment Platforms

The application is ready for deployment on:
- **Vercel** (recommended for frontend)
- **Railway** (full-stack deployment)
- **Heroku** (with PostgreSQL add-on)
- **AWS** (with RDS PostgreSQL)
- **Google Cloud** (with Cloud SQL)

## 📈 Monitoring and Analytics

### Health Checks
- Database connection monitoring
- API endpoint health checks
- Performance monitoring
- Error tracking and logging

### Analytics
- Patient registration trends
- Billing and revenue analytics
- Appointment scheduling patterns
- Inventory usage tracking

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Commit your changes: `git commit -m 'Add new feature'`
4. Push to the branch: `git push origin feature/new-feature`
5. Submit a pull request

### Code Standards
- Follow TypeScript best practices
- Use ESLint and Prettier for code formatting
- Write unit tests for new features
- Update documentation for API changes

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## 📞 Support

For support and questions:
- Create an issue in the repository
- Check the documentation in `/docs`
- Review the API documentation
- Contact the development team

## 🔄 Updates and Changelog

### Version 1.0.0 (Current)
- Initial release with core healthcare management features
- Patient registration and management
- Billing system with payment tracking
- Inventory management and tracking
- Appointment scheduling system
- Treatment logs and medical records
- Role-based access control
- PostgreSQL database integration
- Firebase authentication setup

---

**Healthcare Management Platform** - Streamlining healthcare operations with modern technology.