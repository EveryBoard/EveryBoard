package store

import "gorm.io/gorm"

func applyToQueryResult[T any](db *gorm.DB, result *gorm.DB, action func(T) error) error {
	rows, err := result.Rows()
	if err != nil {
		return err
	}

	// First we gather all elements that match the query
	var elements []T
	for rows.Next() {
		var element T
		err := db.ScanRows(rows, &element)
		if err != nil {
			rows.Close()
			return err
		}
		elements = append(elements, element)
	}
	if err := rows.Err(); err != nil {
		rows.Close()
		return err
	}
	if err := rows.Close(); err != nil {
		return err
	}

	// Then we perform the action on them
	// (On postgresql, we cannot iterate over rows and apply other db actions at the same time)
	for _, element := range elements {
		if err := action(element); err != nil {
			return err
		}
	}
	return nil
}
