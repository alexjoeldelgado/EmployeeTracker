const inquirer = require("inquirer");
const connection = require("./connection");

const functions = {
    start: () => {
    inquirer
        .prompt({
            name: "action",
            type: "list",
            message: "What would you like to do?",
            choices: [
                "Add an Employee",
                "Add a Role",
                "Add a Department",
                "View Employees",
                "View Roles",
                "View Departments",
                "View Employees by Roles",
                "View Employees by Departments",
                "View Employees by Manager",
                "View Budget for Specific Department",
                "Update Employee Role",
                "Update Employee Manager",
                "Delete an Employee",
                "Delete a Role",
                "Delete a Department",
                "Exit"
            ]
        })
        .then(function(answer) {
            switch (answer.action) {
            case "Add an Employee":
                functions.addEmp();
            break;
            case "Add a Role":
                functions.addRol();
            break;
            case "Add a Department":
                functions.addDep();
            break;
            case "View Employees":
                functions.viewEmp();
            break;
            case "View Roles":
                functions.viewRol();
            break;
            case "View Departments":
                functions.viewDep();
            break;
            case "View Employees by Roles":
                functions.viewEmpbyRol();
            break;
            case "View Employees by Departments":
                functions.viewEmpbyDep();
            break;
            case "View Employees by Manager":
                functions.viewEmpbyMan();
            break;
            case "View Budget for Specific Department":
                functions.viewBud();
            break;
            case "Update Employee Role":
                functions.updateEmpRol();
            break;
            case "Update Employee Manager":
                functions.updateEmpMan();
            break;
            case "Delete an Employee":
                functions.deleteEmp();
            break;
            case "Delete a Role":
                functions.deleteRol();
            break;
            case "Delete a Department":
                functions.deleteDep();
            break;
            default:
                connection.end();
            };
        });
    },
    addEmp: () => {
        const initQuery = "SELECT employee.id,first_name,last_name,role.id,title FROM employee RIGHT JOIN role ON role_id = role.id";
        connection.query(initQuery, function(err, result){
            if (err) throw err;
            inquirer
                .prompt([
                    {
                        name: "first_name",
                        type: "input",
                        message: "What is their first name?",
                    },{
                        name: "last_name",
                        type: "input",
                        message: "What is their last name?",
                    },{
                        name: "position",
                        type: "list",
                        message: "What position do they hold?",
                        choices: function(){
                            let posArray = [];
                            for (i=0;i<result.length;i++){
                                if (!posArray.includes(result[i].title)){
                                    posArray.push(result[i].title)  
                                };
                            };
                        return posArray;
                        }
                    },{
                        name: "manager",
                        type: "list",
                        message: "Who is their manager?",
                        choices: function(){
                            let manArray = ["None"];
                            for (i=0;i<result.length;i++){
                                if (result[i].first_name !== null && result[i].last_name !== null){
                                    manArray.push(result[i].first_name + " " + result[i].last_name)
                                };
                            };
                        return manArray;
                        }
                    }]).then(function(data){
                        let posOption;
                        for (i=0;i<result.length;i++) {
                            if(result[i].title === data.position){
                                posOption = result[i];
                            };
                        };
                        let manOption;
                        for (i=0;i<result.length;i++) {
                            if((result[i].first_name + " " + result[i].last_name) === data.manager){
                                manOption = result[i].first_name + " " + result[i].last_name;
                            }else {
                                manOption = data.manager;
                            };
                        };
                        const query = "INSERT INTO employee SET ?";
                        const set = {
                            first_name: data.first_name,
                            last_name: data.last_name,
                            role_id: posOption.id  
                        };
                        if (manOption === "None"){
                            set.manager_id = "None"
                        } else {
                            set.manager_id = manOption
                        };
                        connection.query(query,set,(err) => {
                            if (err) throw err;
                            functions.viewEmp();
                        }); 
                    });
            });
    },
    addRol: () => {
        const initQuery = "SELECT * from department";
        connection.query(initQuery, function(err, result){
            if (err) throw err;
            inquirer
                .prompt([
                    {
                        name: "title",
                        type: "input",
                        message: "What is the position?",
                    },{
                        name: "salary",
                        type: "input",
                        message: "What is the annual salary?",
                    },{
                        name: "department",
                        type: "list",
                        message: "To which department does this position belong to?",
                        choices: result
                    }]).then(function(data){
                        let option;
                        for (i=0;i<result.length;i++) {
                            if(result[i].name === data.department){
                                option = result[i];
                            };
                        };
                    const query = "INSERT INTO role SET ?";
                    const set = {
                        title: data.title,
                        salary: data.salary,
                        department_id: option.id
                    };
                    connection.query(query,set,(err) => {
                        if (err) throw err;
                        functions.viewRol();
                    });
                });
        });
    },
    addDep: () => {
        const initQuery = "SELECT * from department";
        connection.query(initQuery, function(err, result){
            if (err) throw err;
            inquirer
                .prompt([
                    {
                        type: "input",
                        name: "department",
                        message: "What department would you like to add?"
                    }
                ]).then(function(data){
                    let dupCheck;
                    for (i=0;i<result.length;i++){
                        if (result[i].name === data.department){
                            dupCheck = result[i].name
                        };
                    };
                    if (dupCheck === data.department) {
                        console.log("That department already exists! Try again!");
                        functions.viewDep();
                    } else {
                        const query = "INSERT INTO department SET ?";
                        connection.query(query,{name:data.department}, (err, result) => {
                            if (err) throw err;
                            functions.viewDep();
                        })
                    }; 
                });
        });
    },
    viewEmp: () => {
        const query = "SELECT employee.id,first_name, last_name, title, name, salary, manager_id FROM department JOIN role ON department.id = role.department_id JOIN employee ON role.id = employee.role_id";
        connection.query(query, (err, result) => {
            if (err) throw err;
            console.table(result);
            functions.start();
        });
    },
    viewRol: () => {
        const query = "SELECT * from role RIGHT JOIN department ON department_id = department.id";
        connection.query(query,(err, result) => {
            if (err) throw err;
            console.table(result)
            functions.start();
        });
    },
    viewDep: () => {
        const query = "SELECT * from department";
        connection.query(query,(err, result) => {
            if (err) throw err;
            console.table(result);
            functions.start();
        });
    },
    viewEmpbyRol: () => {
        const initQuery = "SELECT * FROM role";
        connection.query(initQuery, function(err, result){
            if (err) throw err;
            inquirer
                .prompt([{
                    name: "position",
                    type: "list",
                    message: "Which role would you like to see?",
                    choices: function(){
                        let posArray = [];
                        for (i=0;i<result.length;i++){
                            if (!posArray.includes(result[i].title)){
                                posArray.push(result[i].title)  
                            };
                        } return posArray;
                    }
                }]).then(function(data){
                    const query = "SELECT employee.id,first_name, last_name, title, name, salary, manager_id FROM department JOIN role ON department.id = role.department_id JOIN employee ON role.id = employee.role_id  WHERE title = ?";
                    connection.query(query, data.position, (err, result) => {
                        if (err) throw err;
                        console.table(result);
                        functions.start();
                    });
                });
        });
    },
    viewEmpbyDep: () => {
        const initQuery = "SELECT * from department";
        connection.query(initQuery, function(err, result1){
            if (err) throw err;
            inquirer
                .prompt({
                    name: "department",
                    type: "list",
                    message: "Which department would you like to see?",
                    choices: result1
            }).then(function(data){
                const query = "SELECT employee.id,first_name, last_name, title, name, salary, manager_id FROM department JOIN role ON department.id = role.department_id JOIN employee ON role.id = employee.role_id  WHERE name = ?";
                connection.query(query, data.department, (err, result2) => {
                    if (err) throw err;
                    console.table(result2);
                    functions.start();
                });
            })
        });
    },
    viewEmpbyMan: () => {
        const initQuery = "SELECT * FROM employee";
        connection.query(initQuery, function(err, result){
            if (err) throw err;
            inquirer
                .prompt({
                    name: "manager",
                    type: "list",
                    message: "Which Manager's team would you like to see?",
                    choices: function(){
                        let manArray = []
                        for (i=0;i<result.length;i++) {
                            if (result[i].manager_id !== "None")
                                manArray.push(result[i].manager_id);
                            } return manArray;
                        }
                }).then(function(data){
                    const query = "SELECT employee.id,first_name, last_name, title, name, salary, manager_id FROM department JOIN role ON department.id = role.department_id JOIN employee ON role.id = employee.role_id  WHERE manager_id = ?";
                    connection.query(query, data.manager, (err, result) => {
                        if (err) throw err;
                        console.table(result);
                        functions.start();
                    });
                });
        });
    },
    viewBud: () => {
        const initQuery = "SELECT * from department";
        connection.query(initQuery, function(err, result1){
            if (err) throw err;
            inquirer
                .prompt({
                    name: "department",
                    type: "list",
                    message: "Which department's budget would you like to see?",
                    choices: result1
            }).then(function(data){
                const query = "SELECT employee.id,first_name, last_name, title, name, salary, manager_id FROM department JOIN role ON department.id = role.department_id JOIN employee ON role.id = employee.role_id  WHERE name = ?";
                connection.query(query, data.department, (err, result2) => {
                    if (err) throw err;
                    let budget = 0;
                    for (i=0;i<result2.length;i++){
                        budget += result2[i].salary;
                    };
                    console.table(result2);
                    console.log(`The Total Budget for this department is $${budget}.`);
                    functions.start();
                });
            });
        });
    },
    updateEmpRol: () => {
        const initQuery = "SELECT * FROM employee";
        connection.query(initQuery,function(err, result1){
            if (err) throw err;
            let empArray = [];
            for (var i = 0; i < result1.length; i++) {
                name = result1[i].first_name + " " + result1[i].last_name;
                empArray.push(name);
            };
            connection.query("SELECT * FROM role", function (err, result2) {
                if (err) throw err;
                let posArray = [];
                for (i=0;i<result2.length;i++){
                    position = result2[i].title
                    posArray.push(position);
                };
                inquirer
                    .prompt([
                        {
                            name: "employee",
                            type: "list",
                            message: "What employee would you like to change positions for?",
                            choices: empArray
                        },{
                            name: "newPosition",
                            type: "list",
                            message: "To what position would you like to move this employee?",
                            choices: posArray
                        }   
                    ]).then(function(data){
                        const query1 = "SELECT * FROM employee";
                        connection.query(query1, (err,result3) => {
                            if (err) throw err;
                            let emp;
                            for (i=0;i<result3.length;i++){
                                if ((result3[i].first_name + " " + result3[i].last_name) === data.employee){
                                    emp = result3[i];
                                };
                            };
                            const query2 = "SELECT * FROM role";
                            connection.query(query2, (err,result4) => {
                                if (err) throw err;
                                let role;
                                for (i=0;i<result4.length;i++){
                                    if (result4[i].title === data.newPosition){
                                        role = result4[i];
                                    };
                                };
                                const query3 = "UPDATE employee SET role_id = ? WHERE id = ?";
                                connection.query(query3, [role.id,emp.id], err => {
                                    if (err) throw err;
                                        functions.viewEmp();
                                })
                            });
                        });
                    });
            });
        });
    },
    updateEmpMan: () => {
        const initQuery = "SELECT * FROM employee";
        connection.query(initQuery,function(err, result1){
            if (err) throw err;
            let empArray = [];
            for (var i = 0; i < result1.length; i++) {
                name = result1[i].first_name + " " + result1[i].last_name;
                empArray.push(name);
            };
            let manArray = ["None",...empArray]; 
                inquirer
                    .prompt([
                        {
                            name: "employee",
                            type: "list",
                            message: "Which employee are you modifying?",
                            choices: empArray
                        },{
                            name: "newManager",
                            type: "list",
                            message: "Who will be their new manager?",
                            choices: manArray
                        }   
                    ]).then(function(data){
                        const query1 = "SELECT * FROM employee";
                        connection.query(query1, (err,result2) => {
                            if (err) throw err;
                            let emp;
                            let newMan;
                            for (i=0;i<result2.length;i++){
                                if ((result2[i].first_name + " " + result2[i].last_name) === data.employee){
                                    emp = result2[i];
                                };
                            };
                            for (i=0;i<result2.length;i++){
                                if ((result2[i].first_name + " " + result2[i].last_name) === data.newManager){
                                    newMan = result2[i].first_name + " " + result2[i].last_name;
                                };
                            };
                            
                                const query3 = "UPDATE employee SET manager_id = ? WHERE id = ?";
                                connection.query(query3, [newMan,emp.id], err => {
                                    if (err) throw err;
                                        functions.viewEmp();
                                })
                            
                        });
                    });
            
        });
    },
    deleteEmp: () => {
        const initQuery = "SELECT * FROM employee";
        connection.query(initQuery,function(err, result){
            if (err) throw err;
            let empArray = [];
            for (var i = 0; i < result.length; i++) {
                name = result[i].first_name + " " + result[i].last_name;
                empArray.push(name);
            };
            inquirer
                .prompt([
                    {
                        name: "employee",
                        type: "list",
                        message: "Which employee would you like to delete?",
                        choices: empArray
                    }   
                ]).then(function(data){
                    const query1 = "SELECT * from employee";
                    connection.query(query1, (err,result1) => {
                        if (err) throw err;
                        let emp;
                        for (i=0;i<result1.length;i++){
                            if ((result1[i].first_name + " " + result1[i].last_name) === data.employee){
                                emp = result1[i];
                            };
                        };
                        const query2 = "DELETE FROM employee where id = ?";
                        connection.query(query2, emp.id, err => {
                            if (err) throw err;
                            functions.viewEmp();
                        });
                    });
                });
        });
    },
    deleteRol: () => {
        const initQuery = "SELECT * FROM role";
        connection.query(initQuery,function(err, result){
            if (err) throw err;
            let rolArray = [];
            for (var i = 0; i < result.length; i++) {
                name = result[i].title;
                rolArray.push(name);
            };
            inquirer
                .prompt([
                    {
                        name: "position",
                        type: "list",
                        message: "Which position would you like to delete?",
                        choices: rolArray
                    }   
                ]).then(function(data){
                    let role;
                    for (i=0;i<result.length;i++){
                        if ((result[i].title) === data.position){
                            role = result[i];
                        };
                    };
                    const query1 = "DELETE FROM role where id = ?";
                    connection.query(query1, role.id, err => {
                        if (err) throw err;
                        functions.viewRol();
                    });
                });
        });
    },
    deleteDep: () => {
        const initQuery = "SELECT * FROM department";
        connection.query(initQuery,function(err, result){
            if (err) throw err;
            let depArray = [];
            for (var i = 0; i < result.length; i++) {
                name = result[i].name;
                depArray.push(name);
            };
            inquirer
                .prompt([
                    {
                        name: "department",
                        type: "list",
                        message: "Which department would you like to delete?",
                        choices: depArray
                    }   
                ]).then(function(data){
                    let dep;
                    for (i=0;i<result.length;i++){
                        if ((result[i].name) === data.department){
                            dep = result[i];
                        };
                    };
                    const query1 = "DELETE FROM department where id = ?";
                    connection.query(query1, dep.id, err => {
                        if (err) throw err;
                        functions.viewDep();
                    });
                });
        });
    }
};

module.exports = functions;