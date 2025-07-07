import React from 'react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import './FilterBar.css';

const FilterBar = ({ filters, onFilterChange, teamMembers }) => {
  const handleSearchChange = (e) => {
    onFilterChange({ ...filters, search: e.target.value });
  };

  const handleDateRangeChange = (dates) => {
    const [start, end] = dates;
    onFilterChange({ ...filters, dateRange: { start, end } });
  };

  const handlePriorityChange = (e) => {
    onFilterChange({ ...filters, priority: e.target.value });
  };

  const handleAssigneeChange = (e) => {
    onFilterChange({ ...filters, assignedTo: e.target.value });
  };

  const handleStatusChange = (e) => {
    onFilterChange({ ...filters, status: e.target.value });
  };

  const clearFilters = () => {
    onFilterChange({
      search: '',
      dateRange: { start: null, end: null },
      priority: '',
      assignedTo: '',
      status: ''
    });
  };

  return (
    <div className="filter-bar">
      <div className="filter-group search-group">
        <i className="fas fa-search search-icon"></i>
        <input
          type="text"
          placeholder="Search hardware issues..."
          value={filters.search}
          onChange={handleSearchChange}
          className="search-input"
        />
      </div>

      <div className="filter-group date-group">
        <i className="fas fa-calendar-alt calendar-icon"></i>
        <DatePicker
          selected={filters.dateRange.start}
          onChange={handleDateRangeChange}
          startDate={filters.dateRange.start}
          endDate={filters.dateRange.end}
          selectsRange
          placeholderText="dd-mm-yyyy"
          dateFormat="dd-MM-yyyy"
          className="date-picker"
        />
      </div>

      <div className="filter-group">
        <select
          value={filters.priority}
          onChange={handlePriorityChange}
          className="filter-select"
        >
          <option value="">All Priorities</option>
          <option value="Low">Low</option>
          <option value="Medium">Medium</option>
          <option value="High">High</option>
          <option value="Critical">Critical</option>
        </select>
      </div>

      <div className="filter-group">
        <select
          value={filters.assignedTo}
          onChange={handleAssigneeChange}
          className="filter-select"
        >
          <option value="">All Assignees</option>
          {teamMembers.map(member => (
            <option key={member._id} value={member.name}>{member.name}</option>
          ))}
        </select>
      </div>

      <div className="filter-group">
        <select
          value={filters.status}
          onChange={handleStatusChange}
          className="filter-select"
        >
          <option value="">All Statuses</option>
          <option value="Open">Open</option>
          <option value="In Progress">In Progress</option>
          <option value="Completed">Completed</option>
          <option value="Critical">Critical</option>
        </select>
      </div>

      <button onClick={clearFilters} className="clear-filters">
        Clear Filters
      </button>
    </div>
  );
};

export default FilterBar; 