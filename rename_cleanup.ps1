
$targetPaths = @("public/assets/atlas", "public/data")

function Clean-Name ($name) {
    $newName = $name.ToLower()
    $newName = $newName.Replace("-", "_")
    $newName = $newName.Replace('`', "")
    
    # Typos
    $newName = $newName.Replace("swort_coast", "sword_coast")
    $newName = $newName.Replace("southewest_faerun", "southwest_faerun")
    $newName = $newName.Replace("kindom_of_many_arrows", "kingdom_of_many_arrows")
    $newName = $newName.Replace("weste_faerun", "west_faerun")
    $newName = $newName.Replace("cemtral_faerun", "central_faerun")
    $newName = $newName.Replace("equipment_ategories", "equipment_categories")
    $newName = $newName.Replace("magic_chools", "magic_schools")
    $newName = $newName.Replace("longsaddel", "longsaddle")
    
    return $newName
}

foreach ($targetPath in $targetPaths) {
    if (Test-Path $targetPath) {
        # Get all items and sort by length descending to rename children before parents
        $items = Get-ChildItem -Path $targetPath -Recurse | Sort-Object {$_.FullName.Length} -Descending
        
        foreach ($item in $items) {
            $newName = Clean-Name $item.Name
            if ($newName -ne $item.Name) {
                Write-Host "Renaming: $($item.FullName) -> $newName"
                $newPath = Join-Path $item.Parent.FullName $newName
                
                if ($item.PSIsContainer) {
                    # Handle folder rename (Windows is case-insensitive, so use temp name if only case changes)
                    $tempName = $item.Name + "_temp_" + (Get-Random)
                    Rename-Item -Path $item.FullName -NewName $tempName
                    Rename-Item -Path (Join-Path $item.Parent.FullName $tempName) -NewName $newName
                } else {
                    # Handle file rename
                    $tempName = $item.Name + "_temp_" + (Get-Random)
                    Rename-Item -Path $item.FullName -NewName $tempName
                    Rename-Item -Path (Join-Path $item.Parent.FullName $tempName) -NewName $newName
                }
            }
        }
    }
}
