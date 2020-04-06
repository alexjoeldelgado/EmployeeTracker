USE employees_db;

INSERT INTO department (name)
VALUES ("F&B"),("Front Office"),("Housekeeping");

INSERT INTO role (title,salary,department_id)
VALUES ("Rooms Controller",20000.00,2),("Front Desk Agent",15000,2),("Housekeeper",25232.64,3),("Server",29300.50,1);

INSERT INTO employee (first_name,last_name,role_id,manager_id)
VALUES ("Shaun","McLellan",1,"None"),("Reagan","Dugger",2,"Shaun McLellan"),("Marcela","Opazo",3,"None"),("Angela","Rizzo",4,"None");