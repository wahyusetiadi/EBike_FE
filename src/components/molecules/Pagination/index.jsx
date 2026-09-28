import "./style.css";

const Pagination = ({ currentPage, totalPage, paginate }) => (
  <nav className="table-pagination" aria-label="Navigasi halaman tabel">
    <button className="table-pagination-control" onClick={() => paginate(1)} disabled={currentPage === 1} aria-label="Halaman pertama">«</button>
    <button className="table-pagination-control" onClick={() => paginate(currentPage - 1)} disabled={currentPage === 1} aria-label="Halaman sebelumnya">‹</button>
    {Array.from({ length: totalPage }, (_, index) => {
      const pageNumber = index + 1;
      if (pageNumber < currentPage - 1 || pageNumber > currentPage + 1) return null;
      return (
        <button
          key={pageNumber}
          className={`table-pagination-page${currentPage === pageNumber ? " is-active" : ""}`}
          onClick={() => paginate(pageNumber)}
          aria-label={`Halaman ${pageNumber}`}
          aria-current={currentPage === pageNumber ? "page" : undefined}
        >
          {pageNumber}
        </button>
      );
    })}
    <button className="table-pagination-control" onClick={() => paginate(currentPage + 1)} disabled={currentPage === totalPage} aria-label="Halaman berikutnya">›</button>
    <button className="table-pagination-control" onClick={() => paginate(totalPage)} disabled={currentPage === totalPage} aria-label="Halaman terakhir">»</button>
  </nav>
);

export default Pagination;
