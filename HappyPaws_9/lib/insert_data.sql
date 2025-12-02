USE happypaws;

-- Insert sample Customers

INSERT INTO Customer (CustomerID, Email, Phone, FName, LName, Address, Password)

VALUES

(1, 'sarah.miller@example.com',  '205-555-1111', 'Sarah',  'Miller',  '123 Oak St, Tuscaloosa, AL', 'password1'),

(2, 'john.smith@example.com',    '205-555-2222', 'John',   'Smith',   '456 Pine St, Tuscaloosa, AL', 'password2'),

(3, 'emily.jones@example.com',   '205-555-3333', 'Emily',  'Jones',   '789 Maple Ave, Tuscaloosa, AL', 'password3'),

(4, 'michael.brown@example.com', '205-555-4444', 'Michael','Brown',   '101 Birch Rd, Tuscaloosa, AL', 'password4'),

(5, 'laura.wilson@example.com',  '205-555-5555', 'Laura',  'Wilson',  '202 Cedar Dr, Tuscaloosa, AL', 'password5');

-- Insert sample Employees

INSERT INTO Employee (EmployeeID, FName, LName, Email, Role)

VALUES

(1, 'Anna',   'Clark',  'anna.clark@example.com',   'Front Desk'),

(2, 'David',  'Turner', 'david.turner@example.com', 'Manager'),

(3, 'Kelly',  'Nguyen', 'kelly.nguyen@example.com', 'Receptionist'),

(4, 'James',  'Lee',    'james.lee@example.com',    'Scheduling'),

(5, 'Olivia', 'Reed',   'olivia.reed@example.com',  'Assistant');

-- Insert sample Trainers

INSERT INTO Trainer (TrainerID, Email, Specialization, FName, LName, YearsOfExperience, Password)

VALUES

(1, 'trainer.alex@example.com',   'Puppy obedience',     'Alex',   'Harris', 5, '123'),

(2, 'trainer.beth@example.com',   'Agility training',    'Beth',   'Rogers', 7, '1234'),

(3, 'trainer.chris@example.com',  'Behavior correction', 'Chris',  'Adams',  10, '12345'),

(4, 'trainer.danielle@example.com','Service dogs',       'Danielle','Moore', 8, '123456'),

(5, 'trainer.ian@example.com',    'Basic obedience',     'Ian',    'Foster', 3, '1234567');

-- Insert sample Pets

INSERT INTO Pet (PetID, Name, Species, Breed, CustomerID)

VALUES

(1, 'Buddy',   'Dog', 'Labrador Retriever', 1),

(2, 'Luna',    'Dog', 'Golden Retriever',   2),

(3, 'Max',     'Dog', 'German Shepherd',    2),

(4, 'Bella',   'Dog', 'Beagle',             3),

(5, 'Charlie', 'Dog', 'Poodle',             4);

-- Insert sample Classes

INSERT INTO Class (ClassID, ClassName, Price, ScheduleDate, Description, Type, Capacity, TrainerID)

VALUES

(1, 'Puppy Basics',        120.00, '2025-01-10 10:00:00', 'Intro obedience for puppies',      'Group',   8, 1),

(2, 'Basic Obedience',     150.00, '2025-01-12 14:00:00', 'Sit, stay, leash manners',         'Group',   10, 5),

(3, 'Agility Level 1',     200.00, '2025-01-15 16:00:00', 'Intro to agility obstacles',       'Group',   6, 2),

(4, 'Behavior Correction', 180.00, '2025-01-18 11:00:00', 'Reactivity & problem behaviors',   'Private', 3, 3),

(5, 'Service Dog Prep',    250.00, '2025-01-20 09:00:00', 'Foundations for service training', 'Group',   5, 4);

-- Insert sample Bookings

-- Booking links: Pet + Customer + Class + Employee

INSERT INTO Booking (BookingID, BookingDate, Status, PetID, CustomerID, ClassID, EmployeeID)

VALUES

(1, '2025-01-05 09:00:00', 'Scheduled', 1, 1, 1, 1), -- Buddy (Sarah) in Puppy Basics, booked by Anna

(2, '2025-01-06 13:30:00', 'Scheduled', 2, 2, 2, 2), -- Luna (John) in Basic Obedience, booked by David

(3, '2025-01-07 15:00:00', 'Completed', 3, 2, 3, 3), -- Max (John) in Agility Level 1, booked by Kelly

(4, '2025-01-08 10:15:00', 'Cancelled', 4, 3, 1, 1), -- Bella (Emily) in Puppy Basics, booked by Anna

(5, '2025-01-09 11:00:00', 'Scheduled', 5, 4, 4, 4), -- Charlie (Michael) in Behavior Correction, booked by James

(6, '2025-01-10 12:45:00', 'Scheduled', 1, 1, 2, 2); -- Buddy (Sarah) also in Basic Obedience, booked by David

