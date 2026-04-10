import { test, expect, type Page } from '@playwright/test'

test.use({ storageState: 'e2e/.auth/admin.json' })

async function irAlTorneo(page: Page): Promise<void> {
  await page.goto('/torneos')
  await page.locator('.MuiFormControl-root', {
    has: page.locator('label').filter({ hasText: /^Mes$/i }),
  }).locator('.MuiSelect-select').click()
  await page.getByRole('option', { name: /diciembre/i }).click()
  await page.locator('.MuiCard-root').first().click()
  await page.locator('.MuiFormControl-root', {
      has: page.locator('label').filter({ hasText: /^Categoría$/i }),
    }).locator('.MuiSelect-select').click()
    await page.getByRole('option').nth(1).click()
    
  
}

async function abrirModalResultado(page: Page): Promise<void> {
  const btn = page.getByRole('button', { name: 'Resultado' }).first()
  await expect(btn).toBeVisible({ timeout: 10_000 })
  await btn.click()
  await expect(page.getByRole('dialog')).toBeVisible()
}



test.describe.serial('Flujo 1 — Admin registra resultado de un combate', () => {

  test('hay combates pendientes con el botón "Resultado" visible', async ({ page }) => {
    await irAlTorneo(page)
    await expect(
      page.getByRole('button', { name: 'Resultado' }).first()
    ).toBeVisible({ timeout: 10_000 })
  })

  test('el modal muestra el título, los indicadores A/R y los contadores I·W·S', async ({ page }) => {
    await irAlTorneo(page)
    await abrirModalResultado(page)
    const dialog = page.getByRole('dialog')

    await expect(dialog.getByText('Registrar resultado')).toBeVisible()

    await expect(dialog.locator('p', { hasText: /^A$/ })).toBeVisible()  
    await expect(dialog.locator('p', { hasText: /^R$/ })).toBeVisible()  

    
    await expect(dialog.locator('.MuiTypography-caption', { hasText: /^I$/ }).first()).toBeVisible()
    await expect(dialog.locator('.MuiTypography-caption', { hasText: /^W$/ }).first()).toBeVisible()
    await expect(dialog.locator('.MuiTypography-caption', { hasText: /^S$/ }).first()).toBeVisible()

    await expect(dialog.locator('.MuiFormControl-root').filter({ hasText: 'Ganador' })).toBeVisible()
    await expect(dialog.locator('.MuiFormControl-root').filter({ hasText: 'Tipo de victoria' })).toBeVisible()

    await dialog.getByRole('button', { name: 'Cancelar' }).click()
    await expect(dialog).not.toBeVisible()
  })

  test('sumar 1 ippon al judoka A auto-detecta el ganador y el tipo "Ippon"', async ({ page }) => {
    await irAlTorneo(page)
    await abrirModalResultado(page)
    const dialog = page.getByRole('dialog')
    await dialog
      .locator('.MuiTypography-caption', { hasText: /^I$/ })
      .first()
      .locator('..')
      .locator('button')
      .last()
      .click()
      
    await expect(dialog.getByText('Ippon')).toBeVisible()

    const ganadorSelect = dialog.locator('.MuiFormControl-root').filter({ hasText: 'Ganador' }).locator('.MuiSelect-select')
    await expect(ganadorSelect).not.toBeEmpty()

    await dialog.getByRole('button', { name: 'Cancelar' }).click()
  })

  test('guardar resultado cierra el modal y el combate aparece como "Finalizado"', async ({ page }) => {
    await irAlTorneo(page)
    await abrirModalResultado(page)
    const dialog = page.getByRole('dialog')

    await dialog.locator('.MuiFormControl-root').filter({ hasText: 'Ganador' }).locator('.MuiSelect-select').click()
    await page.getByRole('option').first().click()

    await dialog.locator('.MuiFormControl-root').filter({ hasText: 'Tipo de victoria' }).locator('.MuiSelect-select').click()
    await page.getByRole('option', { name: 'Ippon' }).click()

    await dialog.getByRole('button', { name: 'Guardar resultado' }).click()

    await expect(dialog).not.toBeVisible({ timeout: 10_000 })

    await expect(
      page.locator('.MuiChip-root', { hasText: /finalizado/i }).first()
    ).toBeVisible({ timeout: 10_000 })
  })

})


test.describe.serial('Flujo 2 — Validación impide guardar resultado incompleto', () => {

  test('guardar sin seleccionar ganador muestra error y el modal permanece abierto', async ({ page }) => {
    await irAlTorneo(page)

    const btn = page.getByRole('button', { name: 'Resultado' }).first()
    if (!await btn.isVisible({ timeout: 5_000 }).catch(() => false)) {
      test.skip()
      return
    }

    await btn.click()
    const dialog = page.getByRole('dialog')

    await dialog.getByRole('button', { name: 'Guardar resultado' }).click()

    await expect(dialog.getByText(/selecciona un ganador/i)).toBeVisible()
    await expect(dialog).toBeVisible()

    await dialog.getByRole('button', { name: 'Cancelar' }).click()
  })

  test('seleccionar ganador pero no tipo de victoria muestra segundo error', async ({ page }) => {
    await irAlTorneo(page)

    const btn = page.getByRole('button', { name: 'Resultado' }).first()
    if (!await btn.isVisible({ timeout: 5_000 }).catch(() => false)) {
      test.skip()
      return
    }

    await btn.click()
    const dialog = page.getByRole('dialog')

    await dialog.locator('.MuiFormControl-root').filter({ hasText: 'Ganador' }).locator('.MuiSelect-select').click()
    await page.getByRole('option').first().click()

    await dialog.getByRole('button', { name: 'Guardar resultado' }).click()

    await expect(dialog.getByText(/selecciona el tipo de victoria/i)).toBeVisible()
    await expect(dialog).toBeVisible()

    await dialog.getByRole('button', { name: 'Cancelar' }).click()
  })

  test('"Cancelar" cierra el modal sin persistir cambios y el combate sigue pendiente', async ({ page }) => {
    await irAlTorneo(page)

    const btn = page.getByRole('button', { name: 'Resultado' }).first()
    if (!await btn.isVisible({ timeout: 5_000 }).catch(() => false)) {
      test.skip()
      return
    }

    const finalizadosAntes = await page.locator('.MuiChip-root', { hasText: /finalizado/i }).count()

    await btn.click()
    const dialog = page.getByRole('dialog')
    
    await dialog.locator('.MuiFormControl-root').filter({ hasText: 'Ganador' }).locator('.MuiSelect-select').click()
    await page.getByRole('option').first().click()

    await dialog.getByRole('button', { name: 'Cancelar' }).click()
    await expect(dialog).not.toBeVisible()

    
    const finalizadosDespues = await page.locator('.MuiChip-root', { hasText: /finalizado/i }).count()
    expect(finalizadosDespues).toBe(finalizadosAntes)
  })

})
