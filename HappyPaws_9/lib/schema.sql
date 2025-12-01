-- Happy Paws Training ERD – core tables
-- This schema is designed for MySQL on Heroku (e.g., ClearDB / JawsDB).

CREATE TABLE Customers (
  CustomerID INT AUTO_INCREMENT PRIMARY KEY,
  FirstName VARCHAR(100) NOT NULL,
  LastName VARCHAR(100) NOT NULL,
  Email VARCHAR(255) NOT NULL UNIQUE,
  Phone VARCHAR(50),
  PasswordHash VARCHAR(255) NOT NULL,
  CreatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE Pets (
  PetID INT AUTO_INCREMENT PRIMARY KEY,
  CustomerID INT NOT NULL,
  Name VARCHAR(100) NOT NULL,
  Species VARCHAR(50) NOT NULL,
  Breed VARCHAR(100),
  BirthDate DATE,
  Notes TEXT,
  CONSTRAINT fk_Pets_Customers FOREIGN KEY (CustomerID)
    REFERENCES Customers(CustomerID)
    ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE Trainers (
  TrainerID INT AUTO_INCREMENT PRIMARY KEY,
  FirstName VARCHAR(100) NOT NULL,
  LastName VARCHAR(100) NOT NULL,
  Email VARCHAR(255) NOT NULL UNIQUE,
  Phone VARCHAR(50),
  Specialty VARCHAR(255),
  HourlyRate DECIMAL(10,2),
  PasswordHash VARCHAR(255) NULL,
  Active TINYINT(1) NOT NULL DEFAULT 1,
  CreatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE Employees (
  EmployeeID INT AUTO_INCREMENT PRIMARY KEY,
  FirstName VARCHAR(100) NOT NULL,
  LastName VARCHAR(100) NOT NULL,
  Role VARCHAR(100) NOT NULL,
  Email VARCHAR(255) NOT NULL UNIQUE,
  Phone VARCHAR(50),
  HireDate DATE,
  Active TINYINT(1) NOT NULL DEFAULT 1
);

CREATE TABLE Classes (
  ClassID INT AUTO_INCREMENT PRIMARY KEY,
  TrainerID INT NOT NULL,
  Title VARCHAR(150) NOT NULL,
  Description TEXT,
  Type ENUM('Group','Private') NOT NULL,
  SkillLevel ENUM('Beginner','Intermediate','Advanced') NOT NULL,
  StartDateTime DATETIME NOT NULL,
  EndDateTime DATETIME NOT NULL,
  Capacity INT NOT NULL,
  Price DECIMAL(10,2) NOT NULL,
  Location VARCHAR(255),
  Status ENUM('Scheduled','Full','Completed','Cancelled') NOT NULL DEFAULT 'Scheduled',
  CONSTRAINT fk_Classes_Trainers FOREIGN KEY (TrainerID)
    REFERENCES Trainers(TrainerID)
    ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE Bookings (
  BookingID INT AUTO_INCREMENT PRIMARY KEY,
  CustomerID INT NOT NULL,
  PetID INT NOT NULL,
  ClassID INT NOT NULL,
  BookingDateTime DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  Status ENUM('Booked','Cancelled','Completed','NoShow') NOT NULL DEFAULT 'Booked',
  PricePaid DECIMAL(10,2) NOT NULL,
  CancelledAt DATETIME NULL,
  CancelledByEmployeeID INT NULL,
  CONSTRAINT fk_Bookings_Customers FOREIGN KEY (CustomerID)
    REFERENCES Customers(CustomerID)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_Bookings_Pets FOREIGN KEY (PetID)
    REFERENCES Pets(PetID)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_Bookings_Classes FOREIGN KEY (ClassID)
    REFERENCES Classes(ClassID)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_Bookings_Employees FOREIGN KEY (CancelledByEmployeeID)
    REFERENCES Employees(EmployeeID)
    ON DELETE SET NULL ON UPDATE CASCADE
);

-- Useful indexes
CREATE INDEX idx_Bookings_ClassID ON Bookings (ClassID);
CREATE INDEX idx_Bookings_CustomerID ON Bookings (CustomerID);
CREATE INDEX idx_Bookings_PetID ON Bookings (PetID);
CREATE INDEX idx_Classes_TrainerID ON Classes (TrainerID);


