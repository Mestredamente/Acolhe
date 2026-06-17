export interface Patient {
  id: string
  name: string
  photoUrl: string
  status: 'Ativo' | 'Inativo'
  lastAppointment: string
  age: number
  cpf: string
  dob: string
  phone: string
  email: string
  address: string
  emergencyContact: {
    name: string
    phone: string
  }
  billing: {
    document: string
    address: string
  }
}

export interface Appointment {
  id: string
  time: string
  patientId: string
  patientName: string
  type: 'Presencial' | 'Online'
}

export const mockPatients: Patient[] = [
  {
    id: '1',
    name: 'Ana Silva',
    photoUrl: 'https://img.usecurling.com/ppl/thumbnail?gender=female&seed=1',
    status: 'Ativo',
    lastAppointment: '2023-10-25',
    age: 28,
    cpf: '123.456.789-00',
    dob: '1995-05-15',
    phone: '+55 11 98765-4321',
    email: 'ana.silva@email.com',
    address: 'Rua das Flores, 123, São Paulo, SP',
    emergencyContact: { name: 'João Silva (Irmão)', phone: '+55 11 91234-5678' },
    billing: { document: '123.456.789-00', address: 'Rua das Flores, 123, São Paulo, SP' },
  },
  {
    id: '2',
    name: 'Carlos Souza',
    photoUrl: 'https://img.usecurling.com/ppl/thumbnail?gender=male&seed=2',
    status: 'Ativo',
    lastAppointment: '2023-10-24',
    age: 42,
    cpf: '234.567.890-11',
    dob: '1981-08-22',
    phone: '+55 21 97654-3210',
    email: 'carlos.souza@email.com',
    address: 'Av. Atlântica, 456, Rio de Janeiro, RJ',
    emergencyContact: { name: 'Maria Souza (Esposa)', phone: '+55 21 92345-6789' },
    billing: { document: '234.567.890-11', address: 'Av. Atlântica, 456, Rio de Janeiro, RJ' },
  },
  {
    id: '3',
    name: 'Beatriz Lima',
    photoUrl: 'https://img.usecurling.com/ppl/thumbnail?gender=female&seed=3',
    status: 'Inativo',
    lastAppointment: '2023-09-10',
    age: 35,
    cpf: '345.678.901-22',
    dob: '1988-11-03',
    phone: '+55 31 96543-2109',
    email: 'beatriz.lima@email.com',
    address: 'Rua da Paz, 789, Belo Horizonte, MG',
    emergencyContact: { name: 'Roberto Lima (Pai)', phone: '+55 31 93456-7890' },
    billing: { document: '345.678.901-22', address: 'Rua da Paz, 789, Belo Horizonte, MG' },
  },
  {
    id: '4',
    name: 'Ricardo Oliveira',
    photoUrl: 'https://img.usecurling.com/ppl/thumbnail?gender=male&seed=4',
    status: 'Ativo',
    lastAppointment: '2023-10-26',
    age: 50,
    cpf: '456.789.012-33',
    dob: '1973-02-18',
    phone: '+55 41 95432-1098',
    email: 'ricardo.oliveira@email.com',
    address: 'Rua do Comércio, 101, Curitiba, PR',
    emergencyContact: { name: 'Sandra Oliveira (Esposa)', phone: '+55 41 94567-8901' },
    billing: { document: '00.123.456/0001-88', address: 'Av. Empresarial, 202, Curitiba, PR' },
  },
  {
    id: '5',
    name: 'Mariana Costa',
    photoUrl: 'https://img.usecurling.com/ppl/thumbnail?gender=female&seed=5',
    status: 'Ativo',
    lastAppointment: '2023-10-20',
    age: 22,
    cpf: '567.890.123-44',
    dob: '2001-07-09',
    phone: '+55 51 94321-0987',
    email: 'mariana.costa@email.com',
    address: 'Av. dos Estados, 303, Porto Alegre, RS',
    emergencyContact: { name: 'Lúcia Costa (Mãe)', phone: '+55 51 95678-9012' },
    billing: { document: '567.890.123-44', address: 'Av. dos Estados, 303, Porto Alegre, RS' },
  },
]

export const mockAppointments: Appointment[] = [
  { id: 'a1', time: '09:00', patientId: '1', patientName: 'Ana Silva', type: 'Presencial' },
  { id: 'a2', time: '11:00', patientId: '2', patientName: 'Carlos Souza', type: 'Online' },
  { id: 'a3', time: '14:30', patientId: '4', patientName: 'Ricardo Oliveira', type: 'Presencial' },
]
