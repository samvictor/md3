# Cleans raw data and makes it appropriate for other parts of MD3
# This includes adding unique ids like "row_1" to every row, 
# and expanding variables with letters into other dimensions with 1 or 0
# as the values


import csv, sys

# Get raw data
datafile = "cars.csv"

# set to True if first column entries are labels
has_labels = False
ignore_cols = []
label_col = 0
limit_output = False

if len(sys.argv) > 1:
    datafile = sys.argv[1]
    if len(sys.argv) > 2:
        if sys.argv == "has_labels":
            has_labels = True
        

# for financial data
ignore_cols = [14, 1]
has_labels = True
label_col = 0
limit_output = True
    
data = []
to_expand = []
header = []
ignored_head_count = 0
ignored_count = 0
with open(datafile, 'rb') as csvfile:
    data_read = csv.reader(csvfile, delimiter=',') # change back to comma
    
    for j, row in enumerate(data_read):
        new_row = []
        if j == 0:
            for i, element in enumerate(row):
                if i not in ignore_cols:
                    new_row.append(element)
                else:
                    ignored_head_count += 1
                
            header = new_row
            data.append(new_row)
            continue
        
        #for i in range(row_begin, len(row)):
        for i, element in enumerate(row):
            new_i = len(new_row)
            if i in ignore_cols and j != 0:
                ignored_count += 1
                continue # meaning this was ignored
            
            if has_labels and i == label_col:
                new_row.append(element)
                continue
            
            try:
                float(element)
                new_row.append(element)
            except:
                if j: # if j != 0, which is where the column labels are
                    temp_element = temp_cell = element.strip()
                    if temp_cell == '':
                        temp_element = 0
                        print "Warning: blank entry found in " + header[i - ignored_head_count] + ", 0 used instead"
                    else:
                        if not new_i in to_expand:
                            to_expand.append(new_i)
                    
                    new_row.append(temp_element)
                    
        data.append(new_row)


# expand string data into different dimensions
for i in to_expand:
    unique_strings = []
    for j, row in enumerate(data):
        if j == 0:
            continue
        
        if row[i] not in unique_strings:
            unique_strings.append(row[i])
        
    for j, row in enumerate(data):
        if j == 0:
            continue
            
        build_row = []
        for s in unique_strings:
            if row[i] == s:
                build_row.append(1)
            else:
                build_row.append(0)
        
        row += build_row
    unique_strings = map(lambda s: str(s)+"_col_"+header[i], unique_strings)
    data[0] += unique_strings

to_expand.sort(reverse = True)


# remove originals with strings from data

#print to_expand
#print len(data[1])

for row in data:
    for j in to_expand:
        del row[j]
        
# add "row_{row num}" and key "md3_id"
data[0] = ["md3_id"] + data[0]
for i in range(1, len(data)):
    data[i] = ["row_"+str(i)] + data[i]


for i, row in enumerate(data):
    if i < 2:
        pass#print row

# file name should only have one dot
with open(datafile.split('.')[0]+'_clean.'+datafile.split('.')[1], 'wb') as fixed_file:
    fixed_writer = csv.writer(fixed_file, delimiter=',')
    
    if limit_output:
        fixed_writer.writerow(data[0])
        
        amount = 398.0
        data_size = 0.0
        data_size = len(data)
        step = 0.0
        step = data_size/amount
        print len(data)
        count = 0
        
        for i in range(1, int(len(data)/step)):
            r = data[i*int(step)]
            fixed_writer.writerow(r)
            count += 1
        
        print "output of", len(data), "limited to",  count
        
    else:
        for r in data:
            fixed_writer.writerow(r)
