import { useState, useEffect } from 'react';
import { supa } from '../lib/supa'; // Ensure the path to supa is correct

// Interface for the data structure
interface Submission {
  id: number;
  absen: string;
  nama: string;
  score: number;
  created_at: string;
  kelas: string;
}

// Interface for filters
interface Filters {
  nama: string;
  kelas: string;
}

const SubmissionsTable = () => {
  const [data, setData] = useState<Submission[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [filteredData, setFilteredData] = useState<Submission[]>([]);
  const [filters, setFilters] = useState<Filters>({ nama: '', kelas: '' });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: fetchedData, error } = await supa
          .from('submissions')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (error) {
          console.error("Error fetching data: ", error.message);
          setLoading(false);
          return;
        }
        
        setData(fetchedData || []); // Ensure data is not null
        setFilteredData(fetchedData || []); // Initialize filteredData
        setLoading(false);
      } catch (err) {
        console.error("Error during fetch: ", err);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>, field: keyof Filters) => {
    const value = e.target.value;
    setFilters((prevFilters) => {
      const newFilters = { ...prevFilters, [field]: value };
      filterData(newFilters); // Apply filter immediately
      return newFilters;
    });
  };

  const filterData = (filters: Filters) => {
    const { nama, kelas } = filters;
    const filtered = data.filter((item) => {
      const matchesNama = nama ? item.nama.toLowerCase().includes(nama.toLowerCase()) : true;
      const matchesKelas = kelas ? item.kelas.toLowerCase().includes(kelas.toLowerCase()) : true;
      return matchesNama && matchesKelas;
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

  const handleDelete = async (id: number) => {
    try {
      // Delete data from the database using Supabase
      const { error } = await supa.from('submissions').delete().eq('id', id);
      if (error) {
        console.error("Error deleting data: ", error.message);
        return;
      }

      // Remove data from local state
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
          onChange={(e) => handleFilterChange(e, 'nama')}
          className="filter-input"
        />
        <input
          type="text"
          placeholder="Filter Kelas"
          value={filters.kelas}
          onChange={(e) => handleFilterChange(e, 'kelas')}
          className="filter-input"
        />
      </div>
      <table className="styled-table">
        <thead>
          <tr>
            <th onClick={() => handleSort('absen')}>No Absen</th>
            <th onClick={() => handleSort('nama')}>Nama</th>
            <th onClick={() => handleSort('score')}>Score</th>
            <th onClick={() => handleSort('created_at')}>Tanggal Pengajuan</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          {filteredData.map((row) => (
            <tr key={row.id} className="table-row">
              <td>{row.absen}</td> {/* Menampilkan No Absen */}
              <td>{row.nama}</td> {/* Menampilkan Nama */}
              <td>{row.score}</td> {/* Menampilkan Score */}
              <td>{row.created_at}</td> {/* Menampilkan Tanggal Pengajuan */}
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
