import React, { useState } from "react";
import PropTypes from "prop-types";
import {
  Search,
  Plus,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

// Contact Card Component
const ContactCard = ({ contact }) => (
  <div className="bg-white border border-gray-200 rounded-2xl p-5 hover:shadow-lg hover:border-blue-500 transition-all duration-300">
    <div className="flex items-start justify-between">
      <div className="flex items-center gap-4">
        <img
          src={contact.avatar}
          alt={contact.name}
          className="w-14 h-14 rounded-full object-cover"
        />
        <div>
          <h3 className="font-bold text-lg text-gray-800">{contact.name}</h3>
          <span className="text-xs font-medium bg-blue-100 text-blue-700 px-3 py-1 rounded-full">
            {contact.role}
          </span>
        </div>
      </div>
      <button className="text-gray-400 hover:text-gray-600">
        <MoreVertical size={20} />
      </button>
    </div>
    <div className="grid grid-cols-2 gap-y-4 gap-x-2 mt-6 text-sm">
      <div>
        <p className="text-gray-500">Phone</p>
        <p className="font-medium text-gray-700">{contact.phone}</p>
      </div>
      <div>
        <p className="text-gray-500">Blood Group</p>
        <p className="font-medium text-gray-700">{contact.bloodGroup}</p>
      </div>
      <div className="col-span-2">
        <p className="text-gray-500">Email</p>
        <p className="font-medium text-gray-700">{contact.email}</p>
      </div>
    </div>
  </div>
);

ContactCard.propTypes = {
  contact: PropTypes.shape({
    avatar: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    role: PropTypes.string.isRequired,
    phone: PropTypes.string.isRequired,
    bloodGroup: PropTypes.string.isRequired,
    email: PropTypes.string.isRequired,
  }).isRequired,
};

// Pagination Component
const Pagination = () => {
  const pages = [1, 2, 3, 4, 5, "...", 38, 39, 40];
  const currentPage = 1;
  return (
    <nav className="flex items-center space-x-1">
      <button className="p-2 rounded hover:bg-gray-100 text-gray-500">
        <ChevronLeft size={20} />
      </button>
      {pages.map((page, index) => (
        <button
          key={`page-${page}-${index}`}
          className={`px-4 py-2 rounded text-sm font-medium ${
            page === currentPage
              ? "bg-blue-600 text-white"
              : "hover:bg-gray-100 text-gray-600"
          } ${page === "..." ? "pointer-events-none" : ""}`}
        >
          {page}
        </button>
      ))}
      <button className="p-2 rounded hover:bg-gray-100 text-gray-500">
        <ChevronRight size={20} />
      </button>
    </nav>
  );
};

// Main Contacts Component
const Contacts = () => {
  const [activeTab, setActiveTab] = useState("Suppliers");

  const suppliers = [
    {
      avatar: "https://i.pravatar.cc/150?u=darlene",
      name: "Darlene Robertson",
      role: "Medicine Representative",
      phone: "(406) 555-0120",
      bloodGroup: "A+ (Positive)",
      email: "robertdarlene@gmail.com",
    },
    {
      avatar: "https://i.pravatar.cc/150?u=johnson",
      name: "Johnson Jones",
      role: "Medicine Representative",
      phone: "(406) 555-0120",
      bloodGroup: "A+ (Positive)",
      email: "johnsonjones@gmail.com",
    },
    {
      avatar: "https://i.pravatar.cc/150?u=esther",
      name: "Esther Howard",
      role: "Logistics Manager",
      phone: "(201) 555-0124",
      bloodGroup: "O- (Negative)",
      email: "esther.h@supplier.com",
    },
  ];

  const employees = [
    {
      avatar: "https://i.pravatar.cc/150?u=jane",
      name: "Jane Doe",
      role: "Pharmacist",
      phone: "(308) 555-0121",
      bloodGroup: "B+ (Positive)",
      email: "jane.doe@medcure.ph",
    },
    {
      avatar: "https://i.pravatar.cc/150?u=john",
      name: "John Smith",
      role: "Cashier",
      phone: "(207) 555-0122",
      bloodGroup: "AB+ (Positive)",
      email: "john.smith@medcure.ph",
    },
  ];

  const dataToShow = activeTab === "Suppliers" ? suppliers : employees;
  const addButtonText =
    activeTab === "Suppliers" ? "Add New Supplier" : "Add New Employee";

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        {/* Tabs */}
        <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-full">
          <button
            onClick={() => setActiveTab("Suppliers")}
            className={`px-6 py-2 rounded-full text-sm font-semibold ${
              activeTab === "Suppliers"
                ? "bg-blue-600 text-white shadow"
                : "text-gray-600"
            }`}
          >
            Suppliers
          </button>
          <button
            onClick={() => setActiveTab("Employees")}
            className={`px-6 py-2 rounded-full text-sm font-semibold ${
              activeTab === "Employees"
                ? "bg-blue-600 text-white shadow"
                : "text-gray-600"
            }`}
          >
            Employees
          </button>
        </div>

        {/* Search and Add Button */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              placeholder="Search by anything"
              className="w-full pl-4 pr-10 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button className="absolute right-1 top-1/2 -translate-y-1/2 bg-green-500 text-white p-1.5 rounded-full hover:bg-green-600">
              <Search size={16} />
            </button>
          </div>
          <button className="flex items-center justify-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-full text-sm font-medium hover:bg-blue-700 shadow w-full sm:w-auto">
            <Plus size={18} />
            {addButtonText}
          </button>
        </div>
      </div>

      {/* Contact Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {dataToShow.map((contact) => (
          <ContactCard key={contact.email} contact={contact} />
        ))}
      </div>

      {/* Pagination */}
      <div className="mt-8 flex justify-center">
        <Pagination />
      </div>
    </div>
  );
};

export default Contacts;
