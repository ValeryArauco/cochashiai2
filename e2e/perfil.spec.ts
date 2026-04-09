import { test, expect, type Page } from '@playwright/test'


function muiSelect(page: Page, labelText: RegExp) {
  return page
    .locator('.MuiFormControl-root', { has: page.locator('label').filter({ hasText: labelText }) })
    .locator('.MuiSelect-select')
}

test('camino feliz: judoka actualiza su perfil', async ({ page }) => {
  test.setTimeout(60000)

  await page.goto('/perfil')

  await expect(page.getByRole('heading', { name: /información personal/i })).toBeVisible({ timeout: 15000 })

  await expect(muiSelect(page, /género/i)).toBeVisible({ timeout: 10000 })

  await page.locator('input[name="fechaNacimiento"]').fill('2000-05-15')

  const celularField = page.getByLabel(/celular/i)
  await celularField.clear()
  await celularField.fill('70000001')

  await muiSelect(page, /género/i).click()
  await expect(page.getByRole('option', { name: 'Masculino' })).toBeVisible()
  await page.getByRole('option', { name: 'Masculino' }).click()

  await muiSelect(page, /tipo de sangre/i).click()
  await expect(page.getByRole('option', { name: 'O+' })).toBeVisible()
  await page.getByRole('option', { name: 'O+' }).click()
  
  const contactoField = page.getByLabel(/contacto de emergencia/i)
  await contactoField.clear()
  await contactoField.fill('70000002')
  
  await muiSelect(page, /relación/i).click()
  await expect(page.getByRole('option', { name: 'padre' })).toBeVisible()
  await page.getByRole('option', { name: 'padre' }).click()

  await page.getByRole('button', { name: /guardar/i }).click()

  await expect(page.getByText(/perfil actualizado correctamente/i)).toBeVisible({ timeout: 15000 })
})
