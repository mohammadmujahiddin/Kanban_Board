import React, { useState, useEffect } from 'react'; 
import axios from 'axios';
import { IoFilter } from "react-icons/io5";
import { RiArrowDropDownLine } from "react-icons/ri";
import { FaPlus } from "react-icons/fa";
import { HiDotsHorizontal } from "react-icons/hi";


const KanbanBoard = () => {
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [grouping, setGrouping] = useState('user'); // Default grouping is by user
  const [ordering, setOrdering] = useState('priority'); // Default ordering is by priority
  const [loading, setLoading] = useState(true); // Loading state
  const [dropdownOpen, setDropdownOpen] = useState(false); // State to manage dropdown visibility

  // Load grouping and ordering preferences from localStorage
  useEffect(() => {
    const savedGrouping = localStorage.getItem('grouping');
    const savedOrdering = localStorage.getItem('ordering');
    if (savedGrouping) setGrouping(savedGrouping);
    if (savedOrdering) setOrdering(savedOrdering);
  }, []);

  // Fetch tasks and users from API
  useEffect(() => {
    setLoading(true);
    axios.get('https://api.quicksell.co/v1/internal/frontend-assignment')
      .then(response => {
        setTasks(response.data.tickets);
        setUsers(response.data.users);
      })
      .catch(error => console.error("Error fetching data:", error))
      .finally(() => setLoading(false));
  }, []);

  // Group tasks by user
  const groupedTasksByUser = () => {
    const userGroups = {};
    users.forEach(user => {
      userGroups[user.id] = { 
        name: user.name, 
        tasks: [], 
        image: user.image ? `/Assets/${user.image}` : null 
      };
    });

    tasks.forEach(task => {
      if (userGroups[task.userId]) {
        userGroups[task.userId].tasks.push(task);
      }
    });

    return userGroups;
  };

  // Group tasks by status
  const groupedTasksByStatus = () => {
    const statusGroups = {
      Todo: [],
      "In Progress": [],
      Done: [],
      Backlog: [],
    };
    tasks.forEach(task => {
      if (statusGroups[task.status]) {
        statusGroups[task.status].push(task);
      }
    });
    return statusGroups;
  };

  // Group tasks by priority
  const groupedTasksByPriority = () => {
    const priorityGroups = {
      NoPriority: [],
      Urgent: [],
      High: [],
      Medium: [],
      Low: [],
    };
    tasks.forEach(task => {
      const priority = task.priority === 0 ? 'NoPriority' :
                      task.priority === 1 ? 'Low' :
                      task.priority === 2 ? 'Medium' :
                      task.priority === 3 ? 'High' :
                      task.priority === 4 ? 'Urgent' : null;
      if (priority) {
        priorityGroups[priority].push(task);
      }
    });
    return priorityGroups;
  };

  // Sort tasks based on the selected criteria
  const sortTasks = (taskList) => {
    return taskList.sort((a, b) => {
      if (ordering === 'priority') {
        return b.priority - a.priority; // Sort descending by priority
      } else if (ordering === 'title') {
        return a.title.localeCompare(b.title); // Sort ascending by title
      }
      return 0;
    });
  };

  // Determine which grouping to use based on the grouping state
  const groupedTasks = grouping === 'user' ? groupedTasksByUser() :
                       grouping === 'priority' ? groupedTasksByPriority() :
                       groupedTasksByStatus();

  if (loading) {
    return <p>Loading tasks...</p>;
  }

  return (
      <div style={{  minHeight: "100vh", overflowX: "hidden" }}>
        <div style={{ padding: "10px", minHeight: "10vh", minWidth: "100vw", display: "flex" }}>
          <div style={{ position: "relative", marginRight: "auto"  }}>
            <div 
              onClick={() => setDropdownOpen(!dropdownOpen)} 
              style={{ 
                backgroundColor: "white", 
                // border: "1px solid gray",
                boxShadow: "0 0 5px rgba(0,0,1,0.5)", 
                borderRadius: "6px", 
                padding: "20px",
                wordSpacing: "5px",
                fontSize: "20px", 
                // textDecorationStyle: "dashed",
                display: "flex", 
                // width: "100vw",
                alignItems: "center", 
                cursor: "pointer" 
              }}
            >
              <IoFilter style={{ fontSize: '20px', marginRight: '5px', color: '#333' }} />
              <span style={{ padding: "0 10px", fontSize: '20px', color: 'black', fontWeight: 'bold' }}>Display</span>
              <RiArrowDropDownLine style={{ fontSize: '24px', marginLeft: '5px', color: '#333' }} />
            </div>
            {dropdownOpen && (
              <div style={{
                position: "absolute",
                top: "50px",
                left: "0",
                minHeight: "100px",
                background: "white",
                border: "1px gray",
                borderRadius: "5px",
                zIndex: 1,
                boxShadow: "0 0 5px rgba(0,0,0,0.2)",
                padding: "2px",
              }}>
                <div style={{ marginBottom: "10px", display: "flex", padding: "10px"}}>
                  <strong style={{ color: "gray" }}>Grouping</strong>
                  <select 
                    onChange={e => { 
                      setGrouping(e.target.value); 
                      localStorage.setItem('grouping', e.target.value); 
                    }} 
                    value={grouping} 
                    style={{ marginLeft: "6vw", padding: "0px", padding: "5px", borderRadius: "5px" }}
                  >
                    <option value="user">User</option>
                    <option value="priority">Priority</option>
                    <option value="status">Status</option>
                  </select>
                </div>
                <div style={{ marginBottom: "10px", display: "flex", padding: "10px"}}>
                  <strong style={{ color: "gray" }}>Ordering</strong>
                  <select 
                    onChange={e => { 
                      setOrdering(e.target.value); 
                      localStorage.setItem('ordering', e.target.value); 
                    }} 
                    value={ordering} 
                    style={{ marginLeft: "6vw", padding: "5px", borderRadius: "5px" }}
                  >
                    <option value="priority">Priority</option>
                    <option value="title">Title</option>
                  </select>
                </div>
              </div>
            )}
          </div>
        </div>

        <div style={{ padding: "10px", minHeight: "90vh", minWidth: "100vw", display: "flex", justifyContent: "space-around", backgroundColor: "#f0f0f0", marginTop:"10px", scrollBehavior: "unset", overflowX: "hidden" }}>
          {grouping === 'user' ? (
            Object.keys(groupedTasks).map(userId => (
              <Column key={userId} tasks={sortTasks(groupedTasks[userId].tasks)} title={groupedTasks[userId].name} userImage={groupedTasks[userId].image} />
            ))
          ) : grouping === 'priority' ? (
            Object.keys(groupedTasks).map(priority => (
              <Column key={priority} tasks={sortTasks(groupedTasks[priority])} title={priority} />
            ))
          ) : (
            Object.keys(groupedTasks).map(status => (
              <Column key={status} tasks={sortTasks(groupedTasks[status])} title={status} />
            ))
          )}
        </div>
      </div>
  );
};

const Column = ({ tasks, title, userImage }) => {
  const [showForm, setShowForm] = useState(false);
  const [newTask, setNewTask] = useState({ title: '', priority: '', status: title });

  const handleAddClick = () => {
    setShowForm(!showForm);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (newTask.title) {
      // Add the new task to your tasks state (use appropriate state management).
      tasks.push({ ...newTask, id: tasks.length + 1 });
      setShowForm(false);
      setNewTask({ title: '', priority: '', status: title });
    }
  };

  return (
    <div style={{ padding: "10px", width: "250px", minHeight: "300px", position: "relative" }}>
      <h3 style={{ display: "flex", alignItems: "center" }}>
        {userImage && (
          <img src={userImage} alt="User" style={{ width: "30px", height: "30px", borderRadius: "50%", marginRight: "10px" }} />
        )}
        {title}
        <button style={{ marginLeft: 'auto', cursor: 'pointer', border:"none" }} onClick={handleAddClick}><FaPlus /></button>
        <div style={{ marginLeft: '10px', cursor: 'pointer' }}><HiDotsHorizontal /></div>
      </h3>

      {showForm && (
        <form onSubmit={handleFormSubmit}>
          <input
            type="text"
            placeholder="Task Title"
            value={newTask.title}
            onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
            required
          />
          <button type="submit">Add Task</button>
        </form>
      )}

      {tasks.length === 0 ? (
        <p>No tasks available</p>
      ) : (
        tasks.map(task => (
          <Task key={task.id} task={task} />
        ))
      )}
    </div>
  );
};


const Task = ({ task }) => {
  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 4:
        return '/Assets/SVG - Urgent Priority colour.svg'; 
      case 3:
        return '/Assets/Img - High Priority.svg';
      case 2:
        return '/Assets/Img - Medium Priority.svg';
      case 1:
        return '/Assets/Img - Low Priority.svg';
      case 0:
        return '/Assets/No-priority.svg';
      default:
        return null;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Todo':
        return '/Assets/To-do.svg';
      case 'In Progress':
        return '/Assets/in-progress.svg';
      case 'Done':
        return '/Assets/Done.svg';
      case 'Backlog':
        return '/Assets/backlog.svg';
      default:
        return null;
    }
  };

  return (
    <div style={{
      display: 'flex', 
      alignItems: 'center', 
      backgroundColor: 'white', 
      borderRadius: '10px',
      boxShadow: '0px 4px 10px rgba(0, 0, 4, 0.5)',
      margin: '15px 0',
      padding: '15px',
    }}>
      <img src={getPriorityIcon(task.priority)} alt="Priority Icon" style={{ width: '20px', height: '20px', marginRight: '5px' }} />
      <img src={getStatusIcon(task.status)} alt="Status Icon" style={{ width: '20px', height: '20px', marginRight: '5px' }} />
      <div style={{ flex: 1 }}>
        <strong>{task.id}</strong> {/* Displaying Task ID */}
        <div>{task.title}</div> {/* Displaying Task Title */}
        <span style={{ color: 'gray' }}>{task.type}</span> {/* Displaying Task Type */}
      </div>
    </div>
  );
};



export default KanbanBoard;
