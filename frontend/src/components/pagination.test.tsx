import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Pagination, type PaginationInfo } from '@/components/pagination';

const basePagination: PaginationInfo = {
  page: 1,
  limit: 10,
  total: 25,
  totalPages: 3,
  hasNext: true,
  hasPrev: false,
};

describe('<Pagination />', () => {
  let onPageChange: ReturnType<typeof vi.fn>;
  let onLimitChange: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    onPageChange = vi.fn();
    onLimitChange = vi.fn();
  });

  it('renderiza indicador de pagina e total', () => {
    render(
      <Pagination
        pagination={basePagination}
        onPageChange={onPageChange}
        onLimitChange={onLimitChange}
      />
    );

    expect(screen.getByText(/pagina 1 de 3/i)).toBeInTheDocument();
    expect(screen.getByText(/25 quests/i)).toBeInTheDocument();
  });

  it('singulariza "quest" quando total = 1', () => {
    render(
      <Pagination
        pagination={{ ...basePagination, total: 1, totalPages: 1, hasNext: false, hasPrev: false }}
        onPageChange={onPageChange}
        onLimitChange={onLimitChange}
      />
    );

    expect(screen.getByText(/1 quest\b/)).toBeInTheDocument();
  });

  it('mostra "Nenhum resultado" quando total = 0', () => {
    render(
      <Pagination
        pagination={{ ...basePagination, total: 0, totalPages: 0, hasNext: false, hasPrev: false }}
        onPageChange={onPageChange}
        onLimitChange={onLimitChange}
      />
    );

    expect(screen.getByText(/nenhum resultado/i)).toBeInTheDocument();
  });

  it('desabilita botao "Anterior" quando hasPrev = false', () => {
    render(
      <Pagination
        pagination={basePagination}
        onPageChange={onPageChange}
        onLimitChange={onLimitChange}
      />
    );

    expect(screen.getByRole('button', { name: /pagina anterior/i })).toBeDisabled();
    expect(screen.getByRole('button', { name: /proxima pagina/i })).not.toBeDisabled();
  });

  it('desabilita botao "Proxima" quando hasNext = false', () => {
    render(
      <Pagination
        pagination={{ ...basePagination, page: 3, hasNext: false, hasPrev: true }}
        onPageChange={onPageChange}
        onLimitChange={onLimitChange}
      />
    );

    expect(screen.getByRole('button', { name: /proxima pagina/i })).toBeDisabled();
    expect(screen.getByRole('button', { name: /pagina anterior/i })).not.toBeDisabled();
  });

  it('chama onPageChange com page-1 ao clicar em Anterior', () => {
    render(
      <Pagination
        pagination={{ ...basePagination, page: 2, hasPrev: true }}
        onPageChange={onPageChange}
        onLimitChange={onLimitChange}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /pagina anterior/i }));

    expect(onPageChange).toHaveBeenCalledWith(1);
  });

  it('chama onPageChange com page+1 ao clicar em Proxima', () => {
    render(
      <Pagination
        pagination={basePagination}
        onPageChange={onPageChange}
        onLimitChange={onLimitChange}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /proxima pagina/i }));

    expect(onPageChange).toHaveBeenCalledWith(2);
  });

  it('chama onLimitChange ao mudar o select de page size', () => {
    render(
      <Pagination
        pagination={basePagination}
        onPageChange={onPageChange}
        onLimitChange={onLimitChange}
      />
    );

    const select = screen.getByRole('combobox', { name: /por pagina/i });
    fireEvent.change(select, { target: { value: '25' } });

    expect(onLimitChange).toHaveBeenCalledWith(25);
  });

  it('tem aria-label no nav', () => {
    render(
      <Pagination
        pagination={basePagination}
        onPageChange={onPageChange}
        onLimitChange={onLimitChange}
      />
    );

    expect(screen.getByRole('navigation', { name: /paginacao de quests/i })).toBeInTheDocument();
  });
});
