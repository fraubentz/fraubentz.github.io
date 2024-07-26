<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Basic PHP and MySQL Website</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <h1>Welcome to My Website</h1>
    <h2>User List</h2>
    <ul>
        <?php
        include 'db_connect.php';

        $sql = "SELECT id, name, email FROM users";
        $result = $conn->query($sql);

        if ($result->num_rows > 0) {
            while($row = $result->fetch_assoc()) {
                echo "<li><strong>Name:</strong> " . $row["name"]. " - <strong>Email:</strong> " . $row["email"]. "</li>";
            }
        } else {
            echo "0 results";
        }

        $conn->close();
        ?>
    </ul>
</body>
</html>
