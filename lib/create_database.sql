-- CREATE DATABASE uauqx98rw924g6sp;

USE uauqx98rw924g6sp;

-- Customer

CREATE TABLE Customer (

    CustomerID INT AUTO_INCREMENT PRIMARY KEY,

    Email VARCHAR(100) NOT NULL UNIQUE,

    Phone VARCHAR(20),

    FName VARCHAR(50) NOT NULL,

    LName VARCHAR(50) NOT NULL,

    Address VARCHAR(255),

    Password VARCHAR(100) NOT NULL

);

-- Employee

CREATE TABLE Employee (

    EmployeeID INT AUTO_INCREMENT PRIMARY KEY,

    FName VARCHAR(50) NOT NULL,

    LName VARCHAR(50) NOT NULL,

    Email VARCHAR(100) NOT NULL UNIQUE,

    Role VARCHAR(50) NOT NULL

);

-- Trainer

CREATE TABLE Trainer (

    TrainerID INT AUTO_INCREMENT PRIMARY KEY,

    Email VARCHAR(100) NOT NULL UNIQUE,

    Specialization VARCHAR(100),

    FName VARCHAR(50) NOT NULL,

    LName VARCHAR(50) NOT NULL,

    YearsOfExperience INT NOT NULL

);

-- Pet

CREATE TABLE Pet (

    PetID INT AUTO_INCREMENT PRIMARY KEY,

    Name VARCHAR(50) NOT NULL,

    Species VARCHAR(50) NOT NULL,

    Breed VARCHAR(50),

    CustomerID INT NOT NULL,

    CONSTRAINT fk_pet_customer

        FOREIGN KEY (CustomerID) REFERENCES Customer(CustomerID)

        ON UPDATE CASCADE

        ON DELETE RESTRICT

);

-- Class

CREATE TABLE Class (

    ClassID INT AUTO_INCREMENT PRIMARY KEY,

    ClassName VARCHAR(100) NOT NULL,

    Price DECIMAL(8,2) NOT NULL,

    ScheduleDate DATETIME NOT NULL,

    Description VARCHAR(255),

    Type VARCHAR(50),

    Capacity INT,

    TrainerID INT NOT NULL,

    CONSTRAINT fk_class_trainer

        FOREIGN KEY (TrainerID) REFERENCES Trainer(TrainerID)

        ON UPDATE CASCADE

        ON DELETE RESTRICT

);

-- Booking

CREATE TABLE Booking (

    BookingID INT AUTO_INCREMENT PRIMARY KEY,

    BookingDate DATETIME NOT NULL,

    Status VARCHAR(30) NOT NULL,

    PetID INT NOT NULL,

    CustomerID INT NOT NULL,

    ClassID INT NOT NULL,

    EmployeeID INT NOT NULL,

    CONSTRAINT fk_booking_pet

        FOREIGN KEY (PetID) REFERENCES Pet(PetID)

        ON UPDATE CASCADE

        ON DELETE RESTRICT,

    CONSTRAINT fk_booking_customer

        FOREIGN KEY (CustomerID) REFERENCES Customer(CustomerID)

        ON UPDATE CASCADE

        ON DELETE RESTRICT,

    CONSTRAINT fk_booking_class

        FOREIGN KEY (ClassID) REFERENCES Class(ClassID)

        ON UPDATE CASCADE

        ON DELETE RESTRICT,

    CONSTRAINT fk_booking_employee

        FOREIGN KEY (EmployeeID) REFERENCES Employee(EmployeeID)

        ON UPDATE CASCADE

        ON DELETE RESTRICT

);

ALTER TABLE Trainer

ADD COLUMN Password VARCHAR(100) NOT NULL;

