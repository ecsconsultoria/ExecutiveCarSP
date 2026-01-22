import React, { useState } from 'react';
import { Navbar, Nav, Button } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

const AppNavbar = () => {
  const [open, setOpen] = useState(false);

  return (
    <Navbar bg="light" expand="lg">
      <Button 
        onClick={() => setOpen(!open)} 
        aria-controls="navbar-nav" 
        aria-expanded={open}
        className="d-lg-none"
      >
        ☰
      </Button>
      <Navbar.Collapse id="navbar-nav" in={open} className="flex-grow-0">
        <Nav className="flex-column">
          <Nav.Link href="#">Home</Nav.Link>
          <Nav.Link href="#">About</Nav.Link>
          <Nav.Link href="#">Contact</Nav.Link>
        </Nav>
      </Navbar.Collapse>
      <Navbar.Text className="ms-auto">My App</Navbar.Text>
    </Navbar>
  );
};

const Sidebar = () => {
  const [show, setShow] = useState(false);

  return (
    <div className={`sidebar ${show ? 'show' : ''}`}>  
      <Button onClick={() => setShow(!show)}>Toggle Sidebar</Button>
      <Nav className={`flex-column ${show ? 'show' : ''}`}>  
        <Nav.Link href="#">Item 1</Nav.Link>
        <Nav.Link href="#">Item 2</Nav.Link>
        <Nav.Link href="#">Item 3</Nav.Link>
      </Nav>
    </div>
  );
};

const MainComponent = () => {
  return (
    <div>
      <AppNavbar />
      <Sidebar />
      <div className="content">
        <h1>Hello, World!</h1>
      </div>
    </div>
  );
};

export default MainComponent;

// CSS for mobile responsiveness
// Adjust these styles according to your requirements
// .sidebar {
//   display: none;
//   position: absolute;
//   width: 250px;
//   background: #f8f9fa;
// }
// .sidebar.show {
//   display: block;
// }
// .content {
//   margin-left: 0;
// }
// @media (min-width: 768px) {
//   .content {
//     margin-left: 250px;
//   }
// }