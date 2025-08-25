import { useState, useEffect } from "react";
import { supa } from "../lib/supa";

// Interface untuk data
interface Submission {
  id: string; // uuid
  nama: string; // text
  absen: number; // int4
  score: number; // int4
  created_at: string; // timestamptz
  test_type: string; // text
}

// Interface untuk filter
interface Filters {
  nama: string;
}

const SubmissionsTable = () => {
  const [data, setData] = useState<Submission[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [filteredData, setFilteredData] = useState<Submission[]>([]);
  const [filters, setFilters] = useState<Filters>({ nama: "" });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: fetchedData, error } = await supa
          .from("submissions")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) {
          console.error("Error fetching data: ", error.message);
          setLoading(false);
          return;
        }

        setData(fetchedData || []);
        setFilteredData(fetchedData || []);
        setLoading(false);
      } catch (err) {
        console.error("Error during fetch: ", err);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleFilterChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: keyof Filters
  ) => {
    const value = e.target.value;
    setFilters((prevFilters) => {
      const newFilters = { ...prevFilters, [field]: value };
      filterData(newFilters);
      return newFilters;
    });
  };

  const filterData = (filters: Filters) => {
    const { nama } = filters;
    const filtered = data.filter((item) => {
      const matchesNama = nama
        ? item.nama.toLowerCase().includes(nama.toLowerCase())
        : true;
      return matchesNama;
    });
    setFilteredData(filtered);
  };

  const handleSort = (field: keyof Submission) => {
    const sortedData = [...filteredData].sort((a, b) => {
      if (a[field] < b[field]) return -1;
      if (a[field] > b[field]) return 1;
      return 0;
    });
    setFilteredData(sortedData);
  };

  // ✅ ganti id ke string
  const handleDelete = async (id: string) => {
    try {
      const { error } = await supa.from("submissions").delete().eq("id", id);
      if (error) {
        console.error("Error deleting data: ", error.message);
        return;
      }

      setData(data.filter((item) => item.id !== id));
      setFilteredData(filteredData.filter((item) => item.id !== id));
    } catch (err) {
      console.error("Error during delete: ", err);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="table-container">
      <h1 className="title">Submissions Table STEMation</h1>
      <div className="filters">
        <input
          type="text"
          placeholder="Filter Nama"
          value={filters.nama}
          onChange={(e) => handleFilterChange(e, "nama")}
          className="filter-input"
        />
      </div>
      <table className="styled-table">
        <thead>
          <tr>
            <th onClick={() => handleSort("absen")}>No Absen</th>
            <th onClick={() => handleSort("nama")}>Nama</th>
            <th onClick={() => handleSort("test_type")}>Tipe Test</th>
            <th onClick={() => handleSort("score")}>Score</th>
            <th onClick={() => handleSort("created_at")}>Tanggal Pengajuan</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          {filteredData.map((row) => (
            <tr key={row.id} className="table-row">
              <td>{row.absen}</td>
              <td>{row.nama}</td>
              <td>{row.test_type}</td>
              <td>{row.score}</td>
              <td>{row.created_at}</td>
              <td>
                <button
                  onClick={() => handleDelete(row.id)}
                  className="delete-button"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SubmissionsTable;
