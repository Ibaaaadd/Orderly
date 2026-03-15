const { query, pool } = require('../config/db')

function normalizeConfiguredItems(configuredItems = []) {
  return Array.isArray(configuredItems)
    ? configuredItems
        .map((item, index) => ({
          selected_menu_id: Number(item?.selected_menu_id) || null,
          selected_level: typeof item?.selected_level === 'string' ? item.selected_level.trim() : null,
          qty: Number(item?.qty) > 0 ? Number(item.qty) : 1,
          sort_order: Number.isInteger(item?.sort_order) ? item.sort_order : index,
        }))
        .filter((item) => item.selected_menu_id)
    : []
}

function normalizePackageRulesInput(packageRules = []) {
  return Array.isArray(packageRules)
    ? packageRules
        .map((rule, index) => ({
          rule_name: typeof rule?.rule_name === 'string' && rule.rule_name.trim()
            ? rule.rule_name.trim()
            : 'Isi Paket',
          sort_order: Number.isInteger(rule?.sort_order) ? rule.sort_order : index,
          configured_items: normalizeConfiguredItems(rule?.configured_items),
        }))
        .filter((rule) => rule.configured_items.length > 0)
    : []
}

async function replacePackageRules(client, packageMenuId, packageRules = []) {
  await client.query('DELETE FROM package_menu_rules WHERE package_menu_id = $1', [packageMenuId])

  const normalizedRules = normalizePackageRulesInput(packageRules)
  for (let ruleIndex = 0; ruleIndex < normalizedRules.length; ruleIndex += 1) {
    const rule = normalizedRules[ruleIndex]
    const ruleRes = await client.query(
      `INSERT INTO package_menu_rules (package_menu_id, rule_name, sort_order)
       VALUES ($1, $2, $3)
       RETURNING id`,
      [packageMenuId, rule.rule_name, rule.sort_order]
    )

    const packageMenuRuleId = ruleRes.rows[0].id
    for (let itemIndex = 0; itemIndex < rule.configured_items.length; itemIndex += 1) {
      const item = rule.configured_items[itemIndex]
      await client.query(
        `INSERT INTO package_menu_rule_items (
           package_menu_rule_id,
           selected_menu_id,
           selected_level,
           qty,
           sort_order
         )
         VALUES ($1, $2, $3, $4, $5)`,
        [
          packageMenuRuleId,
          item.selected_menu_id,
          item.selected_level || null,
          item.qty,
          item.sort_order ?? itemIndex,
        ]
      )
    }
  }
}

/**
 * Menu model – raw SQL queries for the menus table.
 */
const menuModel = {
  /** Get menus with optional filter, search and pagination — returns { rows, total } */
  findAll: async ({ category_id, search, page = 1, limit = 10 } = {}) => {
    const whereParams = []
    let where = ''

    if (category_id) {
      whereParams.push(category_id)
      where += ` AND m.category_id = $${whereParams.length}`
    }
    if (search) {
      whereParams.push(`%${search}%`)
      where += ` AND (m.name ILIKE $${whereParams.length} OR c.name ILIKE $${whereParams.length})`
    }

    const countRes = await query(
      `SELECT COUNT(*) FROM menus m LEFT JOIN categories c ON c.id = m.category_id WHERE m.deleted_at IS NULL${where}`,
      whereParams
    )
    const total = parseInt(countRes.rows[0].count, 10)

    const offset = (page - 1) * limit
    const dataRes = await query(
      `SELECT m.id, m.name, m.price, m.image_url, m.is_available, m.is_package, m.levels,
              c.id AS category_id, c.name AS category_name,
              COALESCE(
                (
                  SELECT json_agg(
                    json_build_object(
                      'id', pmr.id,
                      'rule_name', pmr.rule_name,
                      'sort_order', pmr.sort_order,
                      'configured_items', COALESCE(
                        (
                          SELECT json_agg(
                            json_build_object(
                              'id', item.id,
                              'selected_menu_id', item.selected_menu_id,
                              'selected_menu_name', mi.name,
                              'selected_category_id', mi.category_id,
                              'selected_category_name', ic.name,
                              'selected_menu_levels', mi.levels,
                              'selected_level', item.selected_level,
                              'qty', item.qty,
                              'sort_order', item.sort_order
                            ) ORDER BY item.sort_order ASC, item.id ASC
                          )
                          FROM package_menu_rule_items item
                          LEFT JOIN menus mi ON mi.id = item.selected_menu_id
                          LEFT JOIN categories ic ON ic.id = mi.category_id
                          WHERE item.package_menu_rule_id = pmr.id
                        ),
                        '[]'
                      )
                    ) ORDER BY pmr.sort_order ASC, pmr.id ASC
                  )
                  FROM package_menu_rules pmr
                  WHERE pmr.package_menu_id = m.id
                ),
                '[]'
              ) AS package_rules
         FROM menus m
         LEFT JOIN categories c ON c.id = m.category_id
        WHERE m.deleted_at IS NULL${where}
        ORDER BY m.id ASC
        LIMIT $${whereParams.length + 1} OFFSET $${whereParams.length + 2}`,
      [...whereParams, limit, offset]
    )
    return { rows: dataRes.rows, total }
  },

  /** Find a single active (not deleted) menu by id */
  findById: async (id) => {
    const res = await query(
      `SELECT m.*, c.name AS category_name,
              COALESCE(
                (
                  SELECT json_agg(
                    json_build_object(
                      'id', pmr.id,
                      'rule_name', pmr.rule_name,
                      'sort_order', pmr.sort_order,
                      'configured_items', COALESCE(
                        (
                          SELECT json_agg(
                            json_build_object(
                              'id', item.id,
                              'selected_menu_id', item.selected_menu_id,
                              'selected_menu_name', mi.name,
                              'selected_category_id', mi.category_id,
                              'selected_category_name', ic.name,
                              'selected_menu_levels', mi.levels,
                              'selected_level', item.selected_level,
                              'qty', item.qty,
                              'sort_order', item.sort_order
                            ) ORDER BY item.sort_order ASC, item.id ASC
                          )
                          FROM package_menu_rule_items item
                          LEFT JOIN menus mi ON mi.id = item.selected_menu_id
                          LEFT JOIN categories ic ON ic.id = mi.category_id
                          WHERE item.package_menu_rule_id = pmr.id
                        ),
                        '[]'
                      )
                    ) ORDER BY pmr.sort_order ASC, pmr.id ASC
                  )
                  FROM package_menu_rules pmr
                  WHERE pmr.package_menu_id = m.id
                ),
                '[]'
              ) AS package_rules
         FROM menus m
         LEFT JOIN categories c ON c.id = m.category_id
        WHERE m.id = $1 AND m.deleted_at IS NULL`,
      [id]
    )
    return res.rows[0] || null
  },

  /** Find multiple active menus by ids */
  findByIds: async (ids = []) => {
    if (!Array.isArray(ids) || ids.length === 0) return []
    const res = await query(
      `SELECT m.*, c.name AS category_name
         FROM menus m
         LEFT JOIN categories c ON c.id = m.category_id
        WHERE m.deleted_at IS NULL
          AND m.id = ANY($1::int[])`,
      [ids]
    )
    return res.rows
  },

  /** Get package composition rules for a package menu */
  getPackageRules: async (package_menu_id) => {
    const res = await query(
      `SELECT pmr.id,
              pmr.rule_name,
              pmr.package_menu_id,
              pmr.sort_order,
              COALESCE(
                (
                  SELECT json_agg(
                    json_build_object(
                      'id', item.id,
                      'selected_menu_id', item.selected_menu_id,
                      'selected_menu_name', mi.name,
                      'selected_category_id', mi.category_id,
                      'selected_category_name', ic.name,
                      'selected_menu_levels', mi.levels,
                      'selected_level', item.selected_level,
                      'qty', item.qty,
                      'sort_order', item.sort_order
                    ) ORDER BY item.sort_order ASC, item.id ASC
                  )
                  FROM package_menu_rule_items item
                  LEFT JOIN menus mi ON mi.id = item.selected_menu_id
                  LEFT JOIN categories ic ON ic.id = mi.category_id
                  WHERE item.package_menu_rule_id = pmr.id
                ),
                '[]'
              ) AS configured_items
         FROM package_menu_rules pmr
        WHERE pmr.package_menu_id = $1
        ORDER BY pmr.sort_order ASC, pmr.id ASC`,
      [package_menu_id]
    )
    return res.rows
  },

  /** Find a menu by id regardless of deleted state (for internal/history use) */
  findByIdAny: async (id) => {
    const res = await query(
      'SELECT * FROM menus WHERE id = $1',
      [id]
    )
    return res.rows[0] || null
  },

  /** Create a new menu item */
  create: async ({ category_id, name, price, image_url, is_available, is_package, levels, package_rules }) => {
    const client = await pool.connect()
    try {
      await client.query('BEGIN')
      const res = await client.query(
        `INSERT INTO menus (category_id, name, price, image_url, is_available, is_package, levels)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING id`,
        [category_id || null, name, price, image_url || null, is_available !== false, is_package === true, JSON.stringify(levels || [])]
      )
      const menuId = res.rows[0].id

      if (is_package === true || Array.isArray(package_rules)) {
        await replacePackageRules(client, menuId, Array.isArray(package_rules) ? package_rules : [])
      }

      await client.query('COMMIT')
      return menuModel.findById(menuId)
    } catch (err) {
      await client.query('ROLLBACK')
      throw err
    } finally {
      client.release()
    }
  },

  /** Update an existing menu item (only provided fields) */
  update: async (id, { category_id, name, price, image_url, is_available, is_package, levels, package_rules }) => {
    const fields = []
    const values = []
    let idx = 1

    if (category_id  !== undefined) { fields.push(`category_id = $${idx++}`); values.push(category_id) }
    if (name         !== undefined) { fields.push(`name = $${idx++}`); values.push(name) }
    if (price        !== undefined) { fields.push(`price = $${idx++}`); values.push(price) }
    if (image_url    !== undefined) { fields.push(`image_url = $${idx++}`); values.push(image_url) }
    if (is_available !== undefined) { fields.push(`is_available = $${idx++}`); values.push(is_available) }
    if (is_package   !== undefined) { fields.push(`is_package = $${idx++}`); values.push(is_package) }
    if (levels       !== undefined) { fields.push(`levels = $${idx++}`); values.push(JSON.stringify(levels)) }

    const client = await pool.connect()
    try {
      await client.query('BEGIN')

      if (fields.length) {
        values.push(id)
        const res = await client.query(
          `UPDATE menus SET ${fields.join(', ')} WHERE id = $${idx} RETURNING id`,
          values
        )
        if (!res.rows[0]) {
          await client.query('ROLLBACK')
          return null
        }
      }

      if (package_rules !== undefined || is_package === false) {
        await replacePackageRules(client, id, is_package === false ? [] : (Array.isArray(package_rules) ? package_rules : []))
      }

      await client.query('COMMIT')
      return menuModel.findById(id)
    } catch (err) {
      await client.query('ROLLBACK')
      throw err
    } finally {
      client.release()
    }
  },

  /** Soft-delete a menu item (sets deleted_at, preserves historical order data) */
  delete: async (id) => {
    const res = await query(
      'UPDATE menus SET deleted_at = NOW() WHERE id = $1 AND deleted_at IS NULL RETURNING id',
      [id]
    )
    return res.rows[0] || null
  },
}

module.exports = menuModel
