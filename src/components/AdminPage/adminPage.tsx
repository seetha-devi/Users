import React, { Component } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface State {
  data: User[];
  searchQuery: string;
  currentPage: number;
  rowsPerPage: number;
  selectedRows: Set<string>;
  editingRowId: string | null;
  editedRow: Partial<User>;
}

class AdminPage extends Component<{}, State> {
  constructor(props: {}) {
    super(props);
    this.state = {
      data: [],
      searchQuery: '',
      currentPage: 1,
      rowsPerPage: 10,
      selectedRows: new Set<string>(),
      editingRowId: null,
      editedRow: {},
    };
  }

  componentDidMount() {
    fetch('https://geektrust.s3-ap-southeast-1.amazonaws.com/adminui-problem/members.json')
      .then(response => response.json())
      .then(data => this.setState({ data }));
  }

  handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ searchQuery: event.target.value, currentPage: 1 });
  };

  handleEdit = (id: string) => {
    const user = this.state.data.find(user => user.id === id);
    this.setState({ editingRowId: id, editedRow: { ...user } });
  };

  handleSave = () => {
    const { editedRow, data } = this.state;
    const updatedData = data.map(user => (user.id === editedRow.id ? editedRow : user));
    this.setState({ data: updatedData as User[], editingRowId: null, editedRow: {} });
  };

  handleDelete = (id: string) => {
    const updatedData = this.state.data.filter(user => user.id !== id);
    this.setState({ data: updatedData });
  };

  handleDeleteSelected = () => {
    const updatedData = this.state.data.filter(user => !this.state.selectedRows.has(user.id));
    this.setState({ data: updatedData, selectedRows: new Set<string>() });
  };

  handlePageChange = (page: number) => {
    this.setState({ currentPage: page });
  };

  handleSelectRow = (id: string) => {
    const selectedRows = new Set(this.state.selectedRows);
    if (selectedRows.has(id)) {
      selectedRows.delete(id);
    } else {
      selectedRows.add(id);
    }
    this.setState({ selectedRows });
  };

  handleSelectAllRows = () => {
    const { data, currentPage, rowsPerPage, selectedRows } = this.state;
    const start = (currentPage - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    const currentRows = data.slice(start, end);
    const allSelected = currentRows.every(row => selectedRows.has(row.id));

    currentRows.forEach(row => {
      if (allSelected) {
        selectedRows.delete(row.id);
      } else {
        selectedRows.add(row.id);
      }
    });
    this.setState({ selectedRows });
  };

  handleInputChange = (event: React.ChangeEvent<HTMLInputElement>, field: keyof User) => {
    const { value } = event.target;
    this.setState(prevState => ({
      editedRow: {
        ...prevState.editedRow,
        [field]: value,
      },
    }));
  };

  getFilteredData() {
    const { data, searchQuery } = this.state;
    return data.filter(
      user =>
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.role.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }

  getPaginatedData() {
    const { currentPage, rowsPerPage } = this.state;
    const filteredData = this.getFilteredData();
    const start = (currentPage - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    const paginatedData = filteredData.slice(start, end);
    const totalPages = Math.ceil(filteredData.length / rowsPerPage);
    
    console.log(totalPages); // Move this line if you need to log totalPages
    console.log(filteredData);
    return {
      paginatedData,
      totalPages,
    };
  }
  

  render() {
    const { searchQuery, currentPage, rowsPerPage, selectedRows, editingRowId, editedRow } = this.state;
    const { paginatedData, totalPages } = this.getPaginatedData();

    return (
      <div className='admin-page'>
        <h1 style={{textAlign:'center'}}> Admin UI</h1>
        <input
          type="text"
          placeholder="Search..."
          value={searchQuery}
          onChange={this.handleSearch}
          className="search-icon"
        />
        <table>
          <thead>
            <tr>
              <th><input type="checkbox" onChange={this.handleSelectAllRows} /></th>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedData.map(user => (
              <tr key={user.id} style={{ backgroundColor: selectedRows.has(user.id) ? '#f0f0f0' : 'transparent' }}>
                <td><input type="checkbox" checked={selectedRows.has(user.id)} onChange={() => this.handleSelectRow(user.id)} /></td>
                {editingRowId === user.id ? (
                  <>
                    <td><input type="text" value={editedRow.name} onChange={e => this.handleInputChange(e, 'name')} /></td>
                    <td><input type="text" value={editedRow.email} onChange={e => this.handleInputChange(e, 'email')} /></td>
                    <td><input type="text" value={editedRow.role} onChange={e => this.handleInputChange(e, 'role')} /></td>
                    <td>
                      <button className="save" onClick={this.handleSave}>Save</button>
                    </td>
                  </>
                ) : (
                  <>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td>{user.role}</td>
                    <td>
                      <button className="edit" onClick={() => this.handleEdit(user.id)}>Edit</button>
                      <button className="delete" onClick={() => this.handleDelete(user.id)}>Delete</button>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
        <div className="pagination">
           <button className="delete" onClick={this.handleDeleteSelected}>Delete Selected</button>
            <div className='pagination-pages'>
            <button className="first-page" onClick={() => this.handlePageChange(1)} disabled={currentPage === 1} style={{backgroundColor : currentPage === 1 ? '#2ddb32' : '#d9f1f1e0' , color:currentPage === 1 ? 'blue' : 'black'}}>First</button>
          <button className="previous-page" onClick={() => this.handlePageChange(currentPage - 1)} disabled={currentPage === 1} >Previous</button>
          {Array.from({ length: totalPages }, (_, i) => (
            <button key={i} onClick={() => this.handlePageChange(i + 1)} disabled={currentPage === i + 1} style={{backgroundColor : currentPage === i + 1 ? '#2ddb32' : '#d9f1f1e0',  color:currentPage === i + 1? 'blue' : 'black'}}>
              {i + 1}
            </button>
          ))}
          <button className="next-page" onClick={() => this.handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} >Next</button>
          <button className="last-page" onClick={() => this.handlePageChange(totalPages)} disabled={currentPage === totalPages} style={{backgroundColor : currentPage === totalPages ? '#2ddb32' : '#d9f1f1e0', color:currentPage === totalPages ? 'blue' : 'black'}}>Last</button>
            </div>
        </div>
      
      </div>
    );
  }
}

export default AdminPage;
