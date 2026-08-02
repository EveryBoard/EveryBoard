package store

import "gorm.io/gorm"

func applyToQueryResult[T any](db *gorm.DB, result *gorm.DB, action func(T) error) error {
	rows, err := result.Rows()
	if err != nil {
		return err
	}
	defer rows.Close()

	for rows.Next() {
		var element T
		err := db.ScanRows(rows, &element)
		if err != nil {
			return err
		}

		err = action(element)
		if err != nil {
			return err
		}
	}

	return rows.Err()
}
