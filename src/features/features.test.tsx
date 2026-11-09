import { describe, expect, it } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { DiaPage } from './rezar/DiaPage';
import { EventFormPage } from './agenda/EventFormPage';
import { ToastProvider } from '../ui/feedback';
import { db } from '../db/database';
import { getSettings } from '../db/settings';

function renderAt(path: string, route: string, element: React.ReactNode) {
  return render(
    <ToastProvider>
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route path={route} element={element} />
          <Route path="*" element={<p>outra tela</p>} />
        </Routes>
      </MemoryRouter>
    </ToastProvider>,
  );
}

describe('tela do dia (conteúdo diário)', () => {
  it('mostra tema, orações, frase e gesto do dia; marca oração rezada', async () => {
    renderAt('/dia/2026-12-08', '/dia/:data', <DiaPage />);
    expect(await screen.findByRole('heading', { name: 'O sim de Maria', level: 1 })).toBeInTheDocument();
    expect(screen.getByText(/Maria, cheia de graça, contigo quero dizer/)).toBeInTheDocument();
    await userEvent.click(screen.getByRole('tab', { name: 'Frase' }));
    expect(await screen.findByText(/Um sim confiante pode abrir caminho/)).toBeInTheDocument();
    await userEvent.click(screen.getByRole('tab', { name: 'Manhã' }));
    const btn = screen.getAllByRole('button', { name: 'Marcar como rezada' })[0]!;
    await userEvent.click(btn);
    await waitFor(async () => expect(await db.progress.get('manha:2026-12-08')).toBeDefined());
  });

  it('data sem conteúdo mostra mensagem clara', async () => {
    renderAt('/dia/2031-12-01', '/dia/:data', <DiaPage />);
    expect(await screen.findByText('Ainda não há conteúdo para esta data.')).toBeInTheDocument();
  });

  it('A+ / A− alteram o tamanho do texto salvo', async () => {
    renderAt('/dia/2026-12-08', '/dia/:data', <DiaPage />);
    await userEvent.click(await screen.findByRole('button', { name: 'Aumentar o texto' }));
    await waitFor(async () => expect((await getSettings()).fontSize).toBe('grande'));
  });
});

describe('formulário da agenda', () => {
  it('mostra erros acessíveis e salva atividade válida', async () => {
    renderAt('/agenda/novo', '/agenda/novo', <EventFormPage />);
    await userEvent.click(await screen.findByRole('button', { name: 'Salvar' }));
    expect(await screen.findByText('Informe um título')).toBeInTheDocument();
    expect(screen.getByLabelText('Título *')).toHaveAttribute('aria-invalid', 'true');

    await userEvent.type(screen.getByLabelText('Título *'), 'Novena na casa da Dona Rosa');
    await userEvent.type(screen.getByLabelText('Data *'), '2026-12-18');
    await userEvent.click(screen.getByRole('button', { name: 'Salvar' }));
    expect(await screen.findByText('outra tela')).toBeInTheDocument();
    expect((await db.events.toArray())[0]?.title).toBe('Novena na casa da Dona Rosa');
  });
});
