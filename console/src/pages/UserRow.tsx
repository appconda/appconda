import "./UserRow.css";

const UserRow = ({ user }:{user: any}) => {
  return (
    <div className="user-row">
      <div className="user-info">
        <div className="avatar"></div>
        <span>{user.email}</span>
      </div>
      <div className="last-signed-in">{user.lastSignedIn}</div>
      <div className="joined">{user.joined}</div>
    </div>
  );
};

export default UserRow;
