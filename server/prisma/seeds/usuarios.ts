import { Role } from "../../generated/prisma";

export const usuarios = [
  // Administrador
  {
    correo: "agargore.io@gmail.com",
    contrasenaHash: "8nUqmSDYJXII6kR+oGrPZueIoWBPizXVhk9xlGkS5RCdYG8o", // contrasena creada por mi no cambiar esto...
    nombre: "David Josue Villegas Salas",
    telefono: "60065817",
    rol: Role.ADM,
    activo: true,
    disponible: true,
    cargosActuales: 0,
    limiteCargaTickets: 10
  },
  // Técnicos
  {
    correo: "carlos.tec@empresa.com",
    contrasenaHash: "$2b$10$K7L1OJ45/4Y2nIvhRVpCe.FSmhDdWoXehVzJptJ/op0lSsvqNu/1u",
    nombre: "Carlos Rodríguez",
    telefono: "1000-0001",
    rol: Role.TEC,
    activo: true,
    disponible: true,
    cargosActuales: 2,
    limiteCargaTickets: 5
  },
  {
    correo: "ana.tec@empresa.com",
    contrasenaHash: "$2b$10$K7L1OJ45/4Y2nIvhRVpCe.FSmhDdWoXehVzJptJ/op0lSsvqNu/1u",
    nombre: "Ana Martínez",
    telefono: "1000-0002",
    rol: Role.TEC,
    activo: true,
    disponible: false,
    cargosActuales: 4,
    limiteCargaTickets: 5
  },
  {
    correo: "miguel.tec@empresa.com",
    contrasenaHash: "$2b$10$K7L1OJ45/4Y2nIvhRVpCe.FSmhDdWoXehVzJptJ/op0lSsvqNu/1u",
    nombre: "Miguel Sánchez",
    telefono: "1000-0003",
    rol: Role.TEC,
    activo: true,
    disponible: true,
    cargosActuales: 3,
    limiteCargaTickets: 6
  },
  {
    correo: "laura.tec@empresa.com",
    contrasenaHash: "$2b$10$K7L1OJ45/4Y2nIvhRVpCe.FSmhDdWoXehVzJptJ/op0lSsvqNu/1u",
    nombre: "Laura González",
    telefono: "1000-0004",
    rol: Role.TEC,
    activo: true,
    disponible: true,
    cargosActuales: 1,
    limiteCargaTickets: 5
  },
  // Clientes
  {
    correo: "roberto.user@empresa.com",
    contrasenaHash: "$2b$10$K7L1OJ45/4Y2nIvhRVpCe.FSmhDdWoXehVzJptJ/op0lSsvqNu/1u",
    nombre: "Roberto Vargas",
    telefono: "2000-0001",
    rol: Role.USR,
    activo: true,
    disponible: null,
    cargosActuales: null,
    limiteCargaTickets: null
  },
  {
    correo: "elena.user@empresa.com",
    contrasenaHash: "$2b$10$K7L1OJ45/4Y2nIvhRVpCe.FSmhDdWoXehVzJptJ/op0lSsvqNu/1u",
    nombre: "Elena Ramírez",
    telefono: "2000-0002",
    rol: Role.USR,
    activo: true,
    disponible: null,
    cargosActuales: null,
    limiteCargaTickets: null
  },
  {
    correo: "diego.user@empresa.com",
    contrasenaHash: "$2b$10$K7L1OJ45/4Y2nIvhRVpCe.FSmhDdWoXehVzJptJ/op0lSsvqNu/1u",
    nombre: "Diego Herrera",
    telefono: "2000-0003",
    rol: Role.USR,
    activo: true,
    disponible: null,
    cargosActuales: null,
    limiteCargaTickets: null
  },
  {
    correo: "sofia.user@empresa.com",
    contrasenaHash: "$2b$10$K7L1OJ45/4Y2nIvhRVpCe.FSmhDdWoXehVzJptJ/op0lSsvqNu/1u",
    nombre: "Sofía Mendoza",
    telefono: "2000-0004",
    rol: Role.USR,
    activo: true,
    disponible: null,
    cargosActuales: null,
    limiteCargaTickets: null
  },
  {
    correo: "ricardo.user@empresa.com",
    contrasenaHash: "$2b$10$K7L1OJ45/4Y2nIvhRVpCe.FSmhDdWoXehVzJptJ/op0lSsvqNu/1u",
    nombre: "Ricardo López",
    telefono: "2000-0005",
    rol: Role.USR,
    activo: true,
    disponible: null,
    cargosActuales: null,
    limiteCargaTickets: null
  }
];