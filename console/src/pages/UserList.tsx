import "./UserList.css";
import UserRow from "./UserRow"; // Kullanıcı satırı bileşeni

const UserList = () => {
  const users = [
    {
      email: "stan@bimser.com",
      lastSignedIn: "Today at 3:22 PM",
      joined: "Last Sunday at 12:08 AM",
    },
  ];

  return (
    <div className="user-list-container">
      <div className="header">
        <h1>Users</h1>
        <p>View and manage users</p>
      </div>
      <div className="tabs">
        <button className="tab active">All</button>
        <button className="tab">Invitations</button>
      </div>
      <div className="search-sort">
        <input
          type="text"
          placeholder="Search"
          className="search-bar"
        />
        <select className="sort-select">
          <option value="joined">Sort by: Joined</option>
        </select>
        <button className="create-user">Create user</button>
      </div>
      <div className="user-rows">
        {users.map((user, index) => (
          <UserRow key={index} user={user} />
        ))}
      </div>
    </div>
  );
};

export default UserList;